import Router = require('koa-router');
import logger = require('koa-logger');
import Static = require('koa-static');
import Mount = require('koa-mount');
import Koa = require('koa');
import process = require('process');
import bodyParser = require('koa-bodyparser');

import { authorize, oauthRedirect } from './api/authorization';
import { usersSync } from './webhooks/usersSync';
import { usersDrain } from './webhooks/usersDrain';
import { validateHeapHeader } from './middleware/validateHeapHeader';
import { Context } from 'koa';

import * as path from 'path';

const app = new Koa();
const router = new Router();

const healthCheck = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
  if (ctx.path === '/healthcheck') {
    ctx.status = 200;
  } else {
    await next();
  }
};

router
  .post('/users_sync', usersSync)
  .post('/users_drain', usersDrain)
  .post('/api/authorize', authorize)
  .get('/api/oauth_redirect', oauthRedirect);

app.use(healthCheck);
app.use(logger());
// This is just a simple html page with an authorize button to give the full "effect"
app.use(Mount('/app', Static(path.join(__dirname, 'public'))));
app.use(bodyParser());
app.use(validateHeapHeader);
app.use(router.routes()).use(router.allowedMethods());
app.on('error', (err) => {
  console.log(err);
});

process.on('SIGINT', () => {
  console.info('Interrupted');
  process.exit(0);
});

app.listen(3000);
