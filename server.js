const koa = require('koa');
const router = require('koa-router')();
const koaLogger = require('koa-logger');
const minilog = require('minilog');

const log = minilog('Koa server');
const app = koa();

const port = 3000;

minilog.enable();

router.get('/', function *(next) {
  this.type = 'json';
  this.body = JSON.stringify({response: 'Hello'});
  yield next;
});

app
.use(koaLogger())
.use(router.routes())
.use(router.allowedMethods())
.listen(port, () => log.info(`Listening on port: ${port}`));
