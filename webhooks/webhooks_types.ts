export interface FieldValue {
    "id": string;
    "value": string;
}

export interface ConfigField {
    "field_id": string;
    "field_display_name": string;
    "value": FieldValue;
}

export interface FieldList {
    "fields": ConfigField[]
}

export interface Segment {
    "id": number;
    "name": string;
}

export interface UserIdentifier {
    "id": string;
}

export interface SyncData {
    "segment": Segment;
    "add": UserIdentifier[];
    "remove": UserIdentifier[];
}

export interface DrainData {
    "segment": Segment;
}

export interface BaseWebhookRequest {
    "id_token"?: string;
    "action": string;
    "customer_config": FieldList;
}

export interface SyncRequest extends BaseWebhookRequest {
    "data": SyncData;
}

export interface DrainRequest extends BaseWebhookRequest {
    "data": DrainData;
}
