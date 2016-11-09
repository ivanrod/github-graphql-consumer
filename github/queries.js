const moment = require('moment');
const minilog = require('minilog');
const connector = require('./graphqlConnector.js');

const log = minilog('Koa server');
const lastMonth = moment().subtract(1, 'month').toISOString();
minilog.enable();

function getLastMonthCommits () {
  const lastMonthCommits = `
  {
    viewer {
      login
      repositories(first:30) {
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
                  history(first:30 since:"${lastMonth}" author: {emails: ["frivanrodriguez@gmail.com", "ivan.rodriguez@bq.com"]}) {
                    pageInfo{
                      hasNextPage
                    }
                    edges {
                      node{
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

  return connector(lastMonthCommits).then(response => {
    let {viewer: { repositories: { totalCount: totalRepositories, edges: repositories } } } = response;
    repositories = repositories.map(({node: repository}) => {

      try {
        const { name, ref: { target: { history: { edges: commits } } } } = repository;
        // TODO: Identify user commits with other function
        return {
          name,
          commits
        };
      }
      catch (err) {
        log.error(`Error reading repository "${repository.name}": ${err}`);
      }
    });

    return {
      totalRepositories,
      repositories
    };
  });
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

const repositories = `
{
  viewer {
    login
    repositories {
      totalCount
    }
  }
}
`;

module.exports = {
  repositories,
  stargazers,
  getLastMonthCommits
};
