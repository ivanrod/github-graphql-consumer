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
`

module.exports = {
  repositories,
  stargazers
};
