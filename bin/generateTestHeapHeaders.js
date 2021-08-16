require('dotenv').config();

const { exec } = require("child_process");
const syncData = require('./data/sync.json')
const drainData = require('./data/drain.json')
const yargs = require('yargs');
const CryptoJS = require('crypto-js');

// Use a 5 minute delta for past / future
const TIMESTAMP_DELTA = 5 * 60 * 1000;

const argv = yargs
    .command(
        'gen_request',
        'Generates a curl command to test endpoints in the Partner API example implementation',
    )
    .options({
        type: {
            alias: 't',
            choices: ['sync', 'drain'],
            demandOption: true,
            description: 'Which operation will be requested of the endpoint.'
        },
        url: {
            alias: 'u',
            demandOption: true,
            description: 'The URL to use, including port and path.'
        },
        webhook_secret: {
            alias: 's',
            description: 'Secret key to use.  If none provided, the WEBHOOK_SECRET for this app will be used.'
        },
        id_token: {
            alias: 'i',
            description: 'id_token to use.  If none provided, the ID_TOKEN for this app will be used.'
        },
        time_adjust: {
            alias: 'a',
            choices: ['now', 'future', 'past'],
            default: 'now',
            description: 'Whether the curl command should use GET or POST.'
        },
        print_command: {
            alias: 'p',
            description: 'Print the curl command to the console instead of sending request.',
            boolean: true
        }
    })
    .help()
    .argv;


let timeStamp = +Date.now();
if (argv.time_adjust === 'future'){
    timeStamp += TIMESTAMP_DELTA;
} else if (argv.time_adjust === 'past') {
    timeStamp -= TIMESTAMP_DELTA;
}
let webhookSecret = argv.webhook_secret;
if (!webhookSecret) {
    webhookSecret = process.env.WEBHOOK_SECRET;
}
let idToken = argv.id_token;
if (!idToken) {
    idToken = process.env.ID_TOKEN;
}

let dataBody;
if (argv.type === 'sync') {
    syncData.id_token = idToken;
    dataBody = (JSON.stringify(syncData));
} else {
    drainData.id_token = idToken;
    dataBody = (JSON.stringify(drainData));
}

const hmac = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(
        `${timeStamp}${dataBody}`,
        webhookSecret
    )
);
const command = `curl -v -H 'Content-Type: application/json' -H 'Heap-Hash: ts:${timeStamp},hmac:${hmac}' -d '${dataBody}' ${argv.url}`

console.log(command);

if (!argv.print_command) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}
