const router = require('koa-router')();
const githubLogin = require('./github/login.js');
const queries = require('./github/queries.js');

// Login with github, for example, to use with a GraphQL browser client
router.post('/login', function *(next) {
  if (!this.request.body) {
    return next;
  }

  const { user, password } = this.request.body;

  this.type = 'json';

  yield next;

  yield githubLogin.apply(this, [user, password]);
});

router.get('/repositories/:page', function *(next) {
  const { page } = this.params;

  this.type = 'json';
  this.body = yield queries.repositories(page);

  yield next;

});

module.exports = router;
