# Heap Partner API Example

This project contains a basic webapp which interacts with the new Heap Partner API. The current implementation contains example endpoints for authorization, and processing webhook callbacks to process segment data from Heap. 

You can run this webserver with the following commands:

```bash
### env vars required for testing authorization endpoints
export CLIENT_ID=...
export CLIENT_SECRET=...
export REDIRECT_URI=...

### env vars required for signing/validating webhook signatures
export WEBHOOK_SECRET=...

### actually running the thing
npm install
npm run build
npm run start
```

# Authorization

Authorization is obtained via Oauth2. For more details, see our example implementation in [api/authorization.ts](./api/authorization.ts)

### Using omni-auth?

Checkout the [Heap Oauth2 strategy](https://github.com/chamaeleonidae/omniauth-heap) for OmniAuth, provided by our partners at [Chameleon](https://www.trychameleon.com/).

# Webhooks

## Endpoint Specification

See the webhook endpoint specification [here](./webhook_spec.yaml)

This is an OpenApi spec, you can copy/paste in the [swagger editor](https://editor.swagger.io/) to view.

## Validation

Webhook callbacks from Heap contain a `Heap-Hash` header that contains information to validate the authenticity of the message. Your app, when it registers with Heap, will set up a webhook secret key. This secret key, along with the timestamp of the message, will be used to generate a hash for the message.
Your app should calculate the hash with your known webhook secret key and the timestamp specified and compare it to the hash specified by Heap.
It is recommended that your app also checks that the timestamp is within the threshold of tolerance.

An example implementation of can be found in [middleware/validateHeapHeader.ts](./middleware/validateHeapHeader.ts)

## Webhook Operations

### User Sync

This will be a list of users to add into a certain segment. See [bin/data/sync.json](./bin/data/sync.json) for an example payload.

### Users Drain

This will be a segment ID that should be drained (for cases where the data has gotten out of sync).  See [bin/data/drain.json](./bin/data/drain.json) for an example payload.

## Testing your integration

There are three ways to test your integration, and we recommend completing all of them before enabling the integration for a customer:

1. Local testing: Use the test command in this reference app to test user syncs locally. Example:
   ```bash
    export WEBHOOK_SECRET=INSERT_WEBHOOK_SECRET_KEY_HERE
    
    node bin/generateTestHeapHeaders.js  -t "sync" -u "localhost:3000/users_sync"
   ```
2. Use the “sample segment test” in the Heap UI Developers Hub to quickly check if your webhook is properly receiving requests from Heap.
   When you click “Send sample segment”, Heap will fire a request with dummy users to your webhook.
3. Production testing: Install the Heap snippet from your test environment on a test site to collect some data. Then, create a test segment in Heap (Definitions > Click “New Definition” > Click “New Segment”) and toggle on a sync to your test integration.

