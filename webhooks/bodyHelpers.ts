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

const getSyncInfo = (json: any): webhooks.SyncInfo => ({
    page_number: json.page_number,
    total_pages: json.total_pages,
    sync_task_id: json.sync_task_id,
});

const getUserIdentifiers = (list: any[]): webhooks.UserIdentifier[] => {
    const userIdentifierList: webhooks.UserIdentifier[] = [];
    for (const item of list) {
        if (!item.id) {
            throw new TypeError("Users are missing their IDs")
        }
        userIdentifierList.push({
            id: item.id
        })
    }
    return userIdentifierList;
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
        sync_info: getSyncInfo(json.sync_info),
        add: getUserIdentifiers(json.add || []),
        remove: getUserIdentifiers(json.remove || [])
    };
};

const checkRequiredFieldsExist = (json: any): void => {
    const requiredFields = ["action", "customer_config", "data"]
    for (const field of requiredFields) {
        if (!json[field]) {
            throw new TypeError(`Drain request is missing required field: ${field}`);
        }
    }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const jsonToSyncRequest = (json: any): webhooks.SyncRequest => {
    checkRequiredFieldsExist(json)
    const syncRequest: webhooks.SyncRequest = {
        id_token: json.id_token,
        actionType: json.actionType,
        customer_config: getCustomerConfig(json.customer_config),
        data: getSyncData(json.data)
    }
    return syncRequest;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const jsonToDrainRequest = (json: any): webhooks.DrainRequest => {
    checkRequiredFieldsExist(json)
    const drainRequest: webhooks.DrainRequest = {
        id_token: json.id_token,
        actionType: json.actionType,
        customer_config: getCustomerConfig(json.customer_config),
        data: { segment: getSegment(json.data.segment) }
    }
    return drainRequest;
}

export const getActionTypeFromContext = (ctx: Context): string => {
    const body:any = ctx.request.body;
    if (!body.action) {
        ctx.throw(400, "No action was specified");
    }

    return body.action;
}
