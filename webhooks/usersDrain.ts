import { Context } from "koa";
import { DrainRequest } from "./webhooks";
import { jsonToDrainRequest, getActionFromContext } from "./bodyHelpers"
import { SEGMENT_USERS_DRAIN } from "../constants"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usersDrain = async (ctx: Context, next: () => Promise<any>): Promise<any> => {
    // Validate that this is a request for this endpoint to handle
    const action:string = getActionFromContext(ctx);
    if (action != SEGMENT_USERS_DRAIN) {
        ctx.throw(405, `This endpoint does not support specified action: ${action}`);
    }

    let userRequestData: DrainRequest;
    try {
        userRequestData = jsonToDrainRequest(ctx.request.body);
    } catch (e) {
        ctx.throw(400, `Invalid data format: ${e}`)
    }

    // Validate the id_token for the request
    if (userRequestData.id_token != process.env.ID_TOKEN) {
        ctx.throw(404, "id_token not found");
    }

    // Validate the segment
    // TODO - add validation with a database

    console.log(`Draining segment: ${userRequestData.data.segment.id}`);
    ctx.status = 200;
    await next();
}