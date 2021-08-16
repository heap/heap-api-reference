# Heap Partner API Example
This project contains a basic webapp which interacts with the new Heap Partner API.  The current implementation contains two endpoints for processing webhook callbacks to process segment data from Heap.

You can run this webserver with the following commands:
```
$ npm install
$ npm run build
$ npm run start
```

# Webhooks
## Validation
Webhook callbacks from Heap contain a `Heap-Hash` header that contains information to validate the authenticity of the message.  Your app, when it registers with Heap, will set up a webhook secret key.  This secret key, along with the timestamp of the message, will be used to generate a hash for the message.
Your app should calculate the hash with your known webhook secret key and the timestamp specified and compare it to the hash specified by Heap.
It is recommended that your app also checks that the timestamp is within the threshold of tolerance.

## Webhook Operations
### User Sync
This will be a list of users to add into a certain segment.
### Users Drain
This will be a segment ID that should be drained (for cases where the data has gotten out of sync)

## Testing your endpoint
This repo also contains a command to generate a curl command you can use to test your users sync and users drain endpoints.  Example usage:
```
node bin/generateTestHeapHeaders.js  -t "sync" -u "localhost:3000/users_sync"
```
