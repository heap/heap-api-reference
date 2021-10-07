import Router = require('koa-router');
import logger = require('koa-logger')
import Koa = require('koa');
import {usersSync} from "./webhooks/usersSync";
import {usersDrain} from "./webhooks/usersDrain";
import {validateHeapHeader} from "./middleware/validateHeapHeader";
import {Context} from "koa";

const process = require('process')
const bodyParser = require('koa-bodyparser');


const app = new Koa();
const router = new Router();

const healthCheck =  async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    if (ctx.path === "/healthcheck") {
        ctx.status = 200;
    } else {
        await next();
    }
};

router
    .post('/users_sync', usersSync)
    .post('/users_drain', usersDrain)

app.use(healthCheck)
app.use(logger());
app.use(bodyParser());
app.use(validateHeapHeader);
app.use(router.routes());
app.on('error', (err) => {
    console.log(err)
});

process.on('SIGINT', () => {
    console.info("Interrupted")
    process.exit(0)
})

app.listen(3000);