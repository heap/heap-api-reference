/* eslint-disable @typescript-eslint/no-explicit-any */
require('dotenv').config();

import { Context } from "koa";
import * as CryptoJS from 'crypto-js';
import {
    HEAP_TIMESTAMP_KEY,
    HEAP_HMAC_KEY,
    MAX_OLD_TIMESTAMP_DELTA,
    MAX_FUTURE_TIMESTAMP_DELTA,
} from "../constants";

const extractTimeStampAndHMAC = (heapHeader: string, ctx: Context): Map<string, any> => {
    const heapMap: Map<string, any> = new Map();
    try {
        const tsSegment = heapHeader.split(',')[0];
        const heapSegment = heapHeader.split(',')[1];
        if (tsSegment.split(':')[0] === HEAP_TIMESTAMP_KEY)
            heapMap.set("ts", parseInt(tsSegment.split(':')[1]));
        if (heapSegment.split(':')[0] === HEAP_HMAC_KEY)
            heapMap.set("hmac", heapSegment.split(':')[1]);
    } catch (e) {
        ctx.throw(400, "Improperly formatted \"heap-hash\" header");
    }
    if (!heapMap.has("ts")) {
        ctx.throw(400, "Expected timestamp in \"heap-hash\" header");
    }
    if (!heapMap.has("hmac")) {
        ctx.throw(400, "Expected hmac in \"heap-hash\"");
    }
    return heapMap;
}

const isTimeStampWithinThreshold = (ts: number): boolean => {
    const now = Date.now();
    if ((now - ts) > MAX_OLD_TIMESTAMP_DELTA) {
        return false;
    }
    return (ts - now) < MAX_FUTURE_TIMESTAMP_DELTA;
}

export const validateHeapHeader = async (ctx: Context, next: () => Promise<any>): Promise<any> => {
    const heapHeader = ctx.request.headers["heap-hash"] as string;
    if (!heapHeader) {
         ctx.throw(400, "Expected \"heap-hash\" in the header");
    }

    if (!process.env.SECRET_KEY) {
        ctx.throw(500, "Secret Key has not been configured")
    }

    const heapMap: Map<string, any> = extractTimeStampAndHMAC(heapHeader, ctx)
    if (!isTimeStampWithinThreshold(heapMap.get(HEAP_TIMESTAMP_KEY))) {
        ctx.throw(400, "Timestamp of \"heap-hash\" is not within threshold")
    }

    // The hmac will use the timestamp + data concatenation for the base, and
    // the shared secret key as the key.
    const hmac = CryptoJS.HmacSHA256(
        `${heapMap.get("ts")}${JSON.stringify(ctx.request.body)}`,
        process.env.SECRET_KEY
    );

    if (CryptoJS.enc.Base64.stringify(hmac) != heapMap.get("hmac")) {
        ctx.throw(403, "Invalid hmac");
    }

    await next();
}
