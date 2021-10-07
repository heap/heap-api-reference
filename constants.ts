export const HEAP_TIMESTAMP_KEY = 'ts';
export const HEAP_HMAC_KEY = 'hmac';

// How much older can the originating timestamp be before
// we reject it (in milliseconds). Currently 1 minute
export const MAX_OLD_TIMESTAMP_DELTA = 60 * 1000;

// How far in advance the originating timestamp can be
// before we reject it (in milliseconds). Currently 1 second
export const MAX_FUTURE_TIMESTAMP_DELTA = 1000;

// The two currently supported actions for webhook callbacks
export const SEGMENT_USERS_SYNC = 'segment.users.sync';
export const SEGMENT_USERS_DRAIN = 'segment.users.drain';
