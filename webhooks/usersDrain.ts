import { Context } from 'koa';
import { DrainRequest } from './webhooks_types';
import { jsonToDrainRequest, getActionTypeFromContext } from './bodyHelpers';
import { SEGMENT_USERS_DRAIN } from '../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usersDrain = async (ctx: Context, next: () => Promise<any>): Promise<any> => {
  // Validate that this is a request for this endpoint to handle
  const actionType: string = getActionTypeFromContext(ctx);
  if (actionType != SEGMENT_USERS_DRAIN) {
    ctx.throw(405, `This endpoint does not support specified action: ${actionType}`);
  }

  let userRequestData: DrainRequest;
  try {
    userRequestData = jsonToDrainRequest(ctx.request.body);
  } catch (e) {
    ctx.throw(400, `Invalid data format: ${e}`);
  }

  // Partner Actions:
  // 1 - Validate the id_token which identifies the customer.  If no id_token is provided
  //     the account / environment the one in which the partner app is registered. Ex:
  //         let id_token; // Internal identifier for the customer
  //         if (!userRequestData.id_token) {
  //             id_token = SELF_ID_TOKEN
  //         } else {
  //             // getInternalIdToken will lookup the id_token passed in and return the
  //             // internal representation of the customer for the partner
  //             id_token = getInternalIdToken(userRequestData.id_token)
  //             if (!id_token) {
  //                 ctx.throw(400, "Invalid id_token");
  //             }
  //         }
  // 2 - Validate the segment ID.  If it does not exist, no actionType is required.

  console.log(`Draining segment: ${userRequestData.data.segment.id}`);
  ctx.status = 200;
  await next();
};
