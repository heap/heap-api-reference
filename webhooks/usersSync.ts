import { Context } from "koa";
import { SyncRequest } from "./webhooks";
import { jsonToSyncRequest, getActionFromContext } from "./bodyHelpers";
import { SEGMENT_USERS_SYNC } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usersSync = async (ctx: Context, next: () => Promise<any>): Promise<any> => {
    // Validate that this is a request for this endpoint to handle
    const action:string = getActionFromContext(ctx);
    if (action != SEGMENT_USERS_SYNC) {
        ctx.throw(405, `This endpoint does not support specified action: ${action}`);
    }

    let userRequestData: SyncRequest;
    try {
        userRequestData = jsonToSyncRequest(ctx.request.body);
    } catch (e) {
        ctx.throw(400, `Invalid data format: ${e}`)
    }

    // Validate the id_token for the request
    if (userRequestData.id_token != process.env.ID_TOKEN) {
        ctx.throw(404, "id_token not found");
    }

    // Validate the segment
    // TODO - add validation with a database

    for (const email of userRequestData.data.add) {
        // process the new emails
        console.log(`Adding email ${email.id} for segment ${userRequestData.data.segment.id}`);
    }
    ctx.status = 200;
    await next();
}