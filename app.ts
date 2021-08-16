import Router = require('koa-router');
import logger = require('koa-logger')
import Koa = require('koa');
import { usersSync } from "./webhooks/usersSync";
import { usersDrain } from "./webhooks/usersDrain";
import { validateHeapHeader } from "./middleware/validateHeapHeader";
const bodyParser = require('koa-bodyparser');


const app = new Koa();
const router = new Router();

router
    .post('/users_sync', usersSync)
    .post('/users_drain', usersDrain)

app.use(logger());
app.use(bodyParser());
app.use(validateHeapHeader);
app.use(router.routes());
app.on('error', (err) => {
    console.log(err)
});
app.listen(3000);