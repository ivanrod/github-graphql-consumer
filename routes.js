const router = require('koa-router')();
const githubLogin = require('./github/login.js');

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
