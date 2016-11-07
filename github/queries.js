const moment = require('moment');
const connector = require('./graphqlConnector.js');

const lastMonth = moment().subtract(1, 'month').toISOString();

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
                  history(first:30 since:"${lastMonth}") {
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
    let {viewer: { repositories: { totalCount: totalRepositories, edges: repositories } }} = response;

    repositories = repositories.map(({node: repository}) => {
      try {
        const { name, ref: {target: { history: { edges: commits } } } } = repository;
        // TODO: Identify user commits with other function
        return {
          name,
          commits
        };
      }
      catch (error) {
        let error = new Error(error);
        error.repository = repository;
        throw error;
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
