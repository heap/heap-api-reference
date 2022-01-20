require('dotenv').config();

import { Context } from 'koa';
const axios = require('axios').default;

// The oauth endpoints provided by heap
const HEAP_SERVER = process.env.HEAP_SERVER || 'heapanalytics.com';
const HEAP_OAUTH_ENDPOINT = `https://${HEAP_SERVER}/api/partner/oauth/authorize`;
const HEAP_TOKEN_ENDPOINT = `https://${HEAP_SERVER}/api/partner/oauth/token`;
const HEAP_METADATA_ENDPOINT = `https://${HEAP_SERVER}/api/partner/v1/metadata`;

// Information specific to your partner app.
// If you want to test oauth locally, the following redirect_uri must be registered for your app:
// 'http://localhost:3000/api/oauth-redirect'
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

/**
 * /api/authorize
 *
 * Endpoint to redirect the customer to heap's authorization endpoint.
 * The query params required for the authorization endpoint are:
 *   - client_id      (Client_ID assigned to partner app
 *   - state          (arbitrary value that you want to be included in the response, usually to match redirect requests to customers)
 *   - response_type  (always the literal string 'code')
 *   - redirect_uri   (uri registered for your application. must match exactly!)
 *   - scope:         (comma separated list of oauth scopes. 'segment' allows access to segment data)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authorize = async (ctx: Context, next: () => Promise<any>): Promise<any> => {
  const state = 'Any state that your application wants included in the response.';
  if (!CLIENT_ID) {
    ctx.throw(400, 'missing client_id');
  }
  if (!REDIRECT_URI) {
    ctx.throw(400, 'missing redirect_uri');
  }
  const query = new URLSearchParams({
    client_id: CLIENT_ID, // The client_id of your partner app
    state: state, // any app specific state that you want to be included in the response
    response_type: 'code', // always the literal string 'code'
    redirect_uri: REDIRECT_URI, // uri registered for your application. (must match exactly!)
    scope: 'segment', // comma separated list of oauth scopes.  'segment' allows access to segment data
  });
  const oauthURL = new URL(HEAP_OAUTH_ENDPOINT);
  oauthURL.search = query.toString();
  ctx.redirect(oauthURL.toString());
  await next();
};

/**
 * /api/oauth-redirect
 *
 * The Oauth Redirect URI endpoint.
 * This is the endpoint that partners must register when creating their app in heap.
 *
 * When a request is received on this endpoint, the partner should:
 * 1) validate the `state` param,
 * 2) exchange the authorization code for the access_token/id_token via heap's oauth/token endpoint.
 * 3) associate the tokens with the customer account, and store them securely.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const oauthRedirect = async (ctx: Context, next: () => Promise<any>): Promise<any> => {
  const query = ctx.query;
  if (!query) {
    ctx.throw(400, 'expected query params were missing');
  }
  if (query['error']) {
    ctx.throw(500, query);
  }
  const { code, state } = query;
  if (!code || !state) {
    ctx.throw(400, 'expected params were missing');
  }
  // Partner Actions:
  // - Validate state: Exactly how state is validated will depend on your use case,
  /*
   * Now we can use heaps oauth token endpoint to exchange the authorization_code for an access_token and id_token
   *    - access_token    (a token which can be used to call apis on the user's behalf)
   *    - id_token        (a uuid that will be used in webhook payloads to uniquely identify a customer account)
   *
   * The url for Heap's oauth token endpoint accepts the following parameters in the request body:
   *    - grant_type      (the literal string 'authorization_code')
   *    - code            (the authorization code received from heap)
   *    - redirect_uri    (must be the same as the redirect_uri in the original authorization_code request)
   *    - client_id       (client_id assigned to your partner app (uuid))
   *    - client_secret   (client_secret assigned to your partner app.
   *
   ******* NOTES:
   * 1) client_secret is different from the WEBHOOK_SECRET used to sign webhook request payloads)
   * 2) The token request content type can be either application/json or application/x-www-form-encoded, but
   *    the response will always be application/json.
   */
  try {
    const res = await axios.post(HEAP_TOKEN_ENDPOINT, {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    // Partner actions:
    // 1) verify response contains access_token and id_token (token_type will be 'bearer')
    // 2) associate the id_token and access_token with the customer
    // 3) store access_token securely!!
    // 4) Tell the user to go sync some segments
    const { id_token, access_token, token_type } = res.data;
    if (id_token && access_token && token_type === 'bearer') {

      // Optionally get some metadata about the connected environment
      const metadata = await axios.get(`${HEAP_METADATA_ENDPOINT}/${id_token}`, {
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      });

      ctx.status = 200;
      ctx.response.body = `
<h1>id_token = ${id_token}, access_token = [HIDDEN]</h1>
<p>You've successfully authorized APP to access Heap.  Now go pop on over to heap and
<a href="https://${HEAP_SERVER}/app/definitions?view=segments">select some segments</a> to sync 
and they should start syncing in a few moments.</p>
<p> Connected account info:
<pre>${JSON.stringify(metadata.data, null, 2)}</pre> 
</p>
`;
    } else {
      console.log(
        "Uh-oh! heap's oauth token response did not contain a token. Something is broken",
        res.data,
      );
      if (res.data.error) {
        ctx.throw(500, `error response in the access token endpoint: ${res.data.error}`);
      }
    }
  } catch (e) {
    ctx.throw(
      500,
      `error occurred while getting token: ${e}:  ${JSON.stringify(e.response?.data)}`,
    );
  }
};
