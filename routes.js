const router = require('koa-router')();
const githubLogin = require('./github/login.js');

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

module.exports = router;
