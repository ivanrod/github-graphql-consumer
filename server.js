const koa = require('koa');
const router = require('koa-router')();
const koaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const minilog = require('minilog');
const githubLogin = require('./github/login.js');

const log = minilog('Koa server');
const app = koa();

const port = 3000;

minilog.enable();

router.post('/login', function *(next) {
  if (!this.request.body) {
    return next;
  }

  const { user, password } = this.request.body;

  this.type = 'json';

  yield next;

  yield githubLogin.apply(this, [user, password]);
});

app
.use(koaLogger())
.use(bodyParser())
.use(router.routes())
.use(router.allowedMethods())
.listen(port, () => log.info(`Listening on port: ${port}`));
