const moment = require('moment');
const minilog = require('minilog');
const connector = require('./graphqlConnector.js');

const log = minilog('Koa server');

minilog.enable();

function selectLastMonthCommits(queryResponse) {
  let {
    viewer: {
      repositories: {
        pageInfo: {
          hasNextPage: hasMoreRepositories
        },
        totalCount: totalRepositories,
        edges: repositories
      }
    }
  } = queryResponse;

  repositories = repositories.map(({
    node: repository
  }) => {

    try {
      const {
        name,
        ref: {
          target: {
            history: {
              edges: commits
            }
          }
        }
      } = repository;

      return {
        name,
        commits
      };
    } catch (err) {
      log.error(`Error reading repository "${repository.name}": ${err}`);
    }
  });

  return {
    totalRepositories,
    hasMoreRepositories,
    repositories
  };
}

function repositories() {
  const lastMonth = moment().subtract(1, 'month').toISOString();

  const lastMonthCommits = `
  {
    viewer {
      login
      repositories(first: 30 orderBy: {field: UPDATED_AT direction: DESC}) {
        pageInfo {
          hasNextPage
        }
        totalCount

        edges {
          node {
            name
            ref(qualifiedName: "master") {
              target {
                ... on Commit {
                  history(first:100 since:"${lastMonth}" author: {emails: ["frivanrodriguez@gmail.com", "ivan.rodriguez@bq.com"]}) {
                    pageInfo{
                      hasNextPage
                    }
                    edges {
                      node{
                        message
                        author{
                          user{
                            id
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            stargazers {
              totalCount
            }
          }
        }
      }
    }
  }
  `;

  return connector(lastMonthCommits).then(selectLastMonthCommits);
}

const stargazers = `
{
  viewer {
    login
    repositories(first:30 orderBy: {field: NAME, direction: ASC}) {
      edges {
        node {
          name
          stargazers {
            totalCount
          }
        }
      }
    }
  }
}
`;

module.exports = {
  repositories,
  stargazers,
};
