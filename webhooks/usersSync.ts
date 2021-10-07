import { Context } from 'koa';
import { SyncRequest } from './webhooks_types';
import { jsonToSyncRequest, getActionTypeFromContext } from './bodyHelpers';
import { SEGMENT_USERS_SYNC } from '../constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const usersSync = async (ctx: Context, next: () => Promise<any>): Promise<any> => {
  // Validate that this is a request for this endpoint to handle
  const actionType: string = getActionTypeFromContext(ctx);
  if (actionType != SEGMENT_USERS_SYNC) {
    ctx.throw(405, `This endpoint does not support specified actionType: ${actionType}`);
  }

  let userRequestData: SyncRequest;
  try {
    userRequestData = jsonToSyncRequest(ctx.request.body);
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
  // 2 - Validate the segment ID.  If it does not exist yet, it should be created.

  console.log(
    `Syncing page ${userRequestData.data.sync_info.page_number} of ${userRequestData.data.sync_info.total_pages}
        for sync task ${userRequestData.data.sync_info.sync_task_id}`,
  );

  for (const email of userRequestData.data.add) {
    // process the new emails
    console.log(`Adding email ${email.id} for segment ${userRequestData.data.segment.id}`);
  }

  for (const email of userRequestData.data.remove) {
    // process the emails that should be removed
    console.log(`Removing email ${email.id} for segment ${userRequestData.data.segment.id}`);
  }
  ctx.status = 200;
  await next();
};
