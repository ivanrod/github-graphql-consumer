const koa = require('koa');
const koaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const minilog = require('minilog');
const router = require('./routes.js');

const log = minilog('Koa server');
const app = koa();

const port = 3000;

minilog.enable();

app
.use(koaLogger())
.use(bodyParser())
.use(router.routes())
.use(router.allowedMethods())
.listen(port, () => log.info(`Listening on port: ${port}`));
