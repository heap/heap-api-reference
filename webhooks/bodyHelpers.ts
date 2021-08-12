/* eslint-disable @typescript-eslint/no-explicit-any */
import * as webhooks from "./webhooks_types";
import { Context } from "koa";

const getCustomerConfig = (json: any): webhooks.FieldList => {
    if (!json.fields) {
        throw new TypeError("Customer config fields were not specified");
    }
    const list: any[] = json.fields;
    const configFieldList: webhooks.ConfigField[] = [];
    for (const item of list) {
        const configItem: webhooks.ConfigField = {
            field_display_name: item.field_display_name,
            value: {
                id: item.value.id,
                value: item.value.value
            },
            field_id: item.field_id
        }
        configFieldList.push(configItem);
    }
    return {fields: configFieldList};
};

const getUserEmails = (list: any[]): webhooks.UserEmail[] => {
    const userEmailList: webhooks.UserEmail[] = [];
    for (const item of list) {
        if (!item.id) {
            throw new TypeError("Users are missing their IDs")
        }
        userEmailList.push({
            id: item.id
        })
    }
    return userEmailList;
}

const getSegment = (json: any): webhooks.Segment => {
    if (!json.id) {
        throw new TypeError("Segment is missing ID")
    }
    return {
        id: json.id,
        name: json.name
    };
}
const getSyncData = (json: any): webhooks.SyncData => {
    if (!json.segment || (!json.add && !json.remove)) {
        throw new TypeError("Sync data is missing required fields");
    }
    return {
        segment: getSegment(json.segment),
        add: getUserEmails(json.add || []),
        remove: getUserEmails(json.remove || [])
    };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const jsonToSyncRequest = (json: any): webhooks.SyncRequest => {
    if (!json.action ) {
        throw new TypeError("Sync request is missing required field: action");
    }
    if (!json.customer_config) {
        throw new TypeError("Sync request is missing required field: customer_config");
    }
    if (!json.data) {
        throw new TypeError("Sync request is missing required field: data");
    }
    const syncRequest: webhooks.SyncRequest = {
        id_token: json.id_token,
        action: json.action,
        customer_config: getCustomerConfig(json.customer_config),
        data: getSyncData(json.data)
    }
    return syncRequest;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const jsonToDrainRequest = (json: any): webhooks.DrainRequest => {
    const requiredFields = ["action", "customer_config", "data"]
    for (field of requiredFields) {
        if (!json[field]) {
            throw new TypeError(`Drain request is missing required field: ${field}`);    
        }
    }
    if (!json.action || !json.customer_config || !json.data) {
        
    }

    const drainRequest: webhooks.DrainRequest = {
        id_token: json.id_token,
        action: json.action,
        customer_config: getCustomerConfig(json.customer_config),
        data: { segment: getSegment(json.data.segment) }
    }
    return drainRequest;
}

export const getActionFromContext = (ctx: Context): string => {
    const body:any = ctx.request.body;
    if (!body.action) {
        ctx.throw(400, "No action was specified");
    }

    return body.action;
}