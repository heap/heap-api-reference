import Router = require('koa-router');
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

app.use(bodyParser());
app.use(validateHeapHeader);
app.use(router.routes());

app.listen(3000);