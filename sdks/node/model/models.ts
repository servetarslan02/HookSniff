import localVarRequest from 'request';

export * from './adminRevenueGet200ResponseInner';
export * from './adminSdkUpdatePostRequest';
export * from './adminUsersIdPlanPutRequest';
export * from './adminUsersIdStatusPutRequest';
export * from './alertRule';
export * from './apiKeyInfo';
export * from './applyTemplateRequest';
export * from './applyTemplateResponse';
export * from './auth2faEnablePost200Response';
export * from './authLoginPost200Response';
export * from './authResponse';
export * from './batchReplayRequest';
export * from './batchResponse';
export * from './batchResponseErrorsInner';
export * from './batchWebhookRequest';
export * from './billingPortalPost200Response';
export * from './changePasswordRequest';
export * from './changeRoleRequest';
export * from './confirm2faRequest';
export * from './contactRequest';
export * from './contactResponse';
export * from './createAlertRequest';
export * from './createApiKeyResponse';
export * from './createEndpointRequest';
export * from './createTeamRequest';
export * from './createTransformRuleRequest';
export * from './createWebhookRequest';
export * from './customDomainsPostRequest';
export * from './customerResponse';
export * from './delivery';
export * from './deliveryAttempt';
export * from './deliveryListResponse';
export * from './deliveryTrendResponse';
export * from './deliveryTrendResponseBucketsInner';
export * from './deviceTokenResponse';
export * from './disable2faRequest';
export * from './enable2faRequest';
export * from './endpoint';
export * from './endpointHealth';
export * from './endpointsEndpointIdTransformsTestPostRequest';
export * from './endpointsIdRotateSecretPost200Response';
export * from './forgotPasswordRequest';
export * from './inviteRequest';
export * from './invoiceResponse';
export * from './latencyTrendResponse';
export * from './latencyTrendResponseBucketsInner';
export * from './loginRequest';
export * from './modelError';
export * from './notification';
export * from './notificationListResponse';
export * from './notificationPreferences';
export * from './notificationsUnreadCountGet200Response';
export * from './outboundIpsResponse';
export * from './paginatedUsers';
export * from './playgroundGet200Response';
export * from './portalNotificationsPut200Response';
export * from './portalProfile';
export * from './refreshTokenRequest';
export * from './registerDeviceRequest';
export * from './registerRequest';
export * from './registerSchemaRequest';
export * from './resendVerificationRequest';
export * from './resetPasswordRequest';
export * from './retryPolicy';
export * from './routingInfo';
export * from './searchResult';
export * from './simulatorPostRequest';
export * from './ssoConfigPostRequest';
export * from './statsResponse';
export * from './streamParams';
export * from './subscriptionResponse';
export * from './successRateResponse';
export * from './systemStats';
export * from './systemStatsPlanBreakdownInner';
export * from './systemStatus';
export * from './systemStatusComponentsInner';
export * from './team';
export * from './teamDetailResponse';
export * from './teamInvite';
export * from './teamMember';
export * from './testWebhookRequest';
export * from './testWebhookResponse';
export * from './transformRule';
export * from './twoFactorRequiredResponse';
export * from './updateEndpointRequest';
export * from './updateNotificationPreferences';
export * from './updateProfileRequest';
export * from './updateRoutingRequest';
export * from './upgradeRequest';
export * from './upgradeResponse';
export * from './usageResponse';
export * from './userSummary';
export * from './validateEventRequest';
export * from './verify2faRequest';
export * from './verifyEmailRequest';
export * from './webhookTemplate';

import * as fs from 'fs';

export interface RequestDetailedFile {
    value: Buffer;
    options?: {
        filename?: string;
        contentType?: string;
    }
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;


import { AdminRevenueGet200ResponseInner } from './adminRevenueGet200ResponseInner';
import { AdminSdkUpdatePostRequest } from './adminSdkUpdatePostRequest';
import { AdminUsersIdPlanPutRequest } from './adminUsersIdPlanPutRequest';
import { AdminUsersIdStatusPutRequest } from './adminUsersIdStatusPutRequest';
import { AlertRule } from './alertRule';
import { ApiKeyInfo } from './apiKeyInfo';
import { ApplyTemplateRequest } from './applyTemplateRequest';
import { ApplyTemplateResponse } from './applyTemplateResponse';
import { Auth2faEnablePost200Response } from './auth2faEnablePost200Response';
import { AuthLoginPost200Response } from './authLoginPost200Response';
import { AuthResponse } from './authResponse';
import { BatchReplayRequest } from './batchReplayRequest';
import { BatchResponse } from './batchResponse';
import { BatchResponseErrorsInner } from './batchResponseErrorsInner';
import { BatchWebhookRequest } from './batchWebhookRequest';
import { BillingPortalPost200Response } from './billingPortalPost200Response';
import { ChangePasswordRequest } from './changePasswordRequest';
import { ChangeRoleRequest } from './changeRoleRequest';
import { Confirm2faRequest } from './confirm2faRequest';
import { ContactRequest } from './contactRequest';
import { ContactResponse } from './contactResponse';
import { CreateAlertRequest } from './createAlertRequest';
import { CreateApiKeyResponse } from './createApiKeyResponse';
import { CreateEndpointRequest } from './createEndpointRequest';
import { CreateTeamRequest } from './createTeamRequest';
import { CreateTransformRuleRequest } from './createTransformRuleRequest';
import { CreateWebhookRequest } from './createWebhookRequest';
import { CustomDomainsPostRequest } from './customDomainsPostRequest';
import { CustomerResponse } from './customerResponse';
import { Delivery } from './delivery';
import { DeliveryAttempt } from './deliveryAttempt';
import { DeliveryListResponse } from './deliveryListResponse';
import { DeliveryTrendResponse } from './deliveryTrendResponse';
import { DeliveryTrendResponseBucketsInner } from './deliveryTrendResponseBucketsInner';
import { DeviceTokenResponse } from './deviceTokenResponse';
import { Disable2faRequest } from './disable2faRequest';
import { Enable2faRequest } from './enable2faRequest';
import { Endpoint } from './endpoint';
import { EndpointHealth } from './endpointHealth';
import { EndpointsEndpointIdTransformsTestPostRequest } from './endpointsEndpointIdTransformsTestPostRequest';
import { EndpointsIdRotateSecretPost200Response } from './endpointsIdRotateSecretPost200Response';
import { ForgotPasswordRequest } from './forgotPasswordRequest';
import { InviteRequest } from './inviteRequest';
import { InvoiceResponse } from './invoiceResponse';
import { LatencyTrendResponse } from './latencyTrendResponse';
import { LatencyTrendResponseBucketsInner } from './latencyTrendResponseBucketsInner';
import { LoginRequest } from './loginRequest';
import { ModelError } from './modelError';
import { Notification } from './notification';
import { NotificationListResponse } from './notificationListResponse';
import { NotificationPreferences } from './notificationPreferences';
import { NotificationsUnreadCountGet200Response } from './notificationsUnreadCountGet200Response';
import { OutboundIpsResponse } from './outboundIpsResponse';
import { PaginatedUsers } from './paginatedUsers';
import { PlaygroundGet200Response } from './playgroundGet200Response';
import { PortalNotificationsPut200Response } from './portalNotificationsPut200Response';
import { PortalProfile } from './portalProfile';
import { RefreshTokenRequest } from './refreshTokenRequest';
import { RegisterDeviceRequest } from './registerDeviceRequest';
import { RegisterRequest } from './registerRequest';
import { RegisterSchemaRequest } from './registerSchemaRequest';
import { ResendVerificationRequest } from './resendVerificationRequest';
import { ResetPasswordRequest } from './resetPasswordRequest';
import { RetryPolicy } from './retryPolicy';
import { RoutingInfo } from './routingInfo';
import { SearchResult } from './searchResult';
import { SimulatorPostRequest } from './simulatorPostRequest';
import { SsoConfigPostRequest } from './ssoConfigPostRequest';
import { StatsResponse } from './statsResponse';
import { StreamParams } from './streamParams';
import { SubscriptionResponse } from './subscriptionResponse';
import { SuccessRateResponse } from './successRateResponse';
import { SystemStats } from './systemStats';
import { SystemStatsPlanBreakdownInner } from './systemStatsPlanBreakdownInner';
import { SystemStatus } from './systemStatus';
import { SystemStatusComponentsInner } from './systemStatusComponentsInner';
import { Team } from './team';
import { TeamDetailResponse } from './teamDetailResponse';
import { TeamInvite } from './teamInvite';
import { TeamMember } from './teamMember';
import { TestWebhookRequest } from './testWebhookRequest';
import { TestWebhookResponse } from './testWebhookResponse';
import { TransformRule } from './transformRule';
import { TwoFactorRequiredResponse } from './twoFactorRequiredResponse';
import { UpdateEndpointRequest } from './updateEndpointRequest';
import { UpdateNotificationPreferences } from './updateNotificationPreferences';
import { UpdateProfileRequest } from './updateProfileRequest';
import { UpdateRoutingRequest } from './updateRoutingRequest';
import { UpgradeRequest } from './upgradeRequest';
import { UpgradeResponse } from './upgradeResponse';
import { UsageResponse } from './usageResponse';
import { UserSummary } from './userSummary';
import { ValidateEventRequest } from './validateEventRequest';
import { Verify2faRequest } from './verify2faRequest';
import { VerifyEmailRequest } from './verifyEmailRequest';
import { WebhookTemplate } from './webhookTemplate';

/* tslint:disable:no-unused-variable */
let primitives = [
                    "string",
                    "boolean",
                    "double",
                    "integer",
                    "long",
                    "float",
                    "number",
                    "any"
                 ];

let enumsMap: {[index: string]: any} = {
        "AdminUsersIdPlanPutRequest.PlanEnum": AdminUsersIdPlanPutRequest.PlanEnum,
        "AlertRule.ConditionEnum": AlertRule.ConditionEnum,
        "AlertRule.ChannelsEnum": AlertRule.ChannelsEnum,
        "ChangeRoleRequest.RoleEnum": ChangeRoleRequest.RoleEnum,
        "CreateAlertRequest.ConditionEnum": CreateAlertRequest.ConditionEnum,
        "CreateEndpointRequest.RoutingStrategyEnum": CreateEndpointRequest.RoutingStrategyEnum,
        "CreateEndpointRequest.FormatEnum": CreateEndpointRequest.FormatEnum,
        "CustomerResponse.PlanEnum": CustomerResponse.PlanEnum,
        "Delivery.StatusEnum": Delivery.StatusEnum,
        "Endpoint.RoutingStrategyEnum": Endpoint.RoutingStrategyEnum,
        "Endpoint.FormatEnum": Endpoint.FormatEnum,
        "InviteRequest.RoleEnum": InviteRequest.RoleEnum,
        "RegisterDeviceRequest.PlatformEnum": RegisterDeviceRequest.PlatformEnum,
        "RetryPolicy.BackoffEnum": RetryPolicy.BackoffEnum,
        "SsoConfigPostRequest.ProviderEnum": SsoConfigPostRequest.ProviderEnum,
        "StreamParams.StatusEnum": StreamParams.StatusEnum,
        "SystemStatus.OverallStatusEnum": SystemStatus.OverallStatusEnum,
        "UpdateEndpointRequest.RoutingStrategyEnum": UpdateEndpointRequest.RoutingStrategyEnum,
        "UpdateEndpointRequest.FormatEnum": UpdateEndpointRequest.FormatEnum,
        "UpdateRoutingRequest.RoutingStrategyEnum": UpdateRoutingRequest.RoutingStrategyEnum,
        "UpgradeRequest.PlanEnum": UpgradeRequest.PlanEnum,
        "UpgradeRequest.ProviderEnum": UpgradeRequest.ProviderEnum,
}

let typeMap: {[index: string]: any} = {
    "AdminRevenueGet200ResponseInner": AdminRevenueGet200ResponseInner,
    "AdminSdkUpdatePostRequest": AdminSdkUpdatePostRequest,
    "AdminUsersIdPlanPutRequest": AdminUsersIdPlanPutRequest,
    "AdminUsersIdStatusPutRequest": AdminUsersIdStatusPutRequest,
    "AlertRule": AlertRule,
    "ApiKeyInfo": ApiKeyInfo,
    "ApplyTemplateRequest": ApplyTemplateRequest,
    "ApplyTemplateResponse": ApplyTemplateResponse,
    "Auth2faEnablePost200Response": Auth2faEnablePost200Response,
    "AuthLoginPost200Response": AuthLoginPost200Response,
    "AuthResponse": AuthResponse,
    "BatchReplayRequest": BatchReplayRequest,
    "BatchResponse": BatchResponse,
    "BatchResponseErrorsInner": BatchResponseErrorsInner,
    "BatchWebhookRequest": BatchWebhookRequest,
    "BillingPortalPost200Response": BillingPortalPost200Response,
    "ChangePasswordRequest": ChangePasswordRequest,
    "ChangeRoleRequest": ChangeRoleRequest,
    "Confirm2faRequest": Confirm2faRequest,
    "ContactRequest": ContactRequest,
    "ContactResponse": ContactResponse,
    "CreateAlertRequest": CreateAlertRequest,
    "CreateApiKeyResponse": CreateApiKeyResponse,
    "CreateEndpointRequest": CreateEndpointRequest,
    "CreateTeamRequest": CreateTeamRequest,
    "CreateTransformRuleRequest": CreateTransformRuleRequest,
    "CreateWebhookRequest": CreateWebhookRequest,
    "CustomDomainsPostRequest": CustomDomainsPostRequest,
    "CustomerResponse": CustomerResponse,
    "Delivery": Delivery,
    "DeliveryAttempt": DeliveryAttempt,
    "DeliveryListResponse": DeliveryListResponse,
    "DeliveryTrendResponse": DeliveryTrendResponse,
    "DeliveryTrendResponseBucketsInner": DeliveryTrendResponseBucketsInner,
    "DeviceTokenResponse": DeviceTokenResponse,
    "Disable2faRequest": Disable2faRequest,
    "Enable2faRequest": Enable2faRequest,
    "Endpoint": Endpoint,
    "EndpointHealth": EndpointHealth,
    "EndpointsEndpointIdTransformsTestPostRequest": EndpointsEndpointIdTransformsTestPostRequest,
    "EndpointsIdRotateSecretPost200Response": EndpointsIdRotateSecretPost200Response,
    "ForgotPasswordRequest": ForgotPasswordRequest,
    "InviteRequest": InviteRequest,
    "InvoiceResponse": InvoiceResponse,
    "LatencyTrendResponse": LatencyTrendResponse,
    "LatencyTrendResponseBucketsInner": LatencyTrendResponseBucketsInner,
    "LoginRequest": LoginRequest,
    "ModelError": ModelError,
    "Notification": Notification,
    "NotificationListResponse": NotificationListResponse,
    "NotificationPreferences": NotificationPreferences,
    "NotificationsUnreadCountGet200Response": NotificationsUnreadCountGet200Response,
    "OutboundIpsResponse": OutboundIpsResponse,
    "PaginatedUsers": PaginatedUsers,
    "PlaygroundGet200Response": PlaygroundGet200Response,
    "PortalNotificationsPut200Response": PortalNotificationsPut200Response,
    "PortalProfile": PortalProfile,
    "RefreshTokenRequest": RefreshTokenRequest,
    "RegisterDeviceRequest": RegisterDeviceRequest,
    "RegisterRequest": RegisterRequest,
    "RegisterSchemaRequest": RegisterSchemaRequest,
    "ResendVerificationRequest": ResendVerificationRequest,
    "ResetPasswordRequest": ResetPasswordRequest,
    "RetryPolicy": RetryPolicy,
    "RoutingInfo": RoutingInfo,
    "SearchResult": SearchResult,
    "SimulatorPostRequest": SimulatorPostRequest,
    "SsoConfigPostRequest": SsoConfigPostRequest,
    "StatsResponse": StatsResponse,
    "StreamParams": StreamParams,
    "SubscriptionResponse": SubscriptionResponse,
    "SuccessRateResponse": SuccessRateResponse,
    "SystemStats": SystemStats,
    "SystemStatsPlanBreakdownInner": SystemStatsPlanBreakdownInner,
    "SystemStatus": SystemStatus,
    "SystemStatusComponentsInner": SystemStatusComponentsInner,
    "Team": Team,
    "TeamDetailResponse": TeamDetailResponse,
    "TeamInvite": TeamInvite,
    "TeamMember": TeamMember,
    "TestWebhookRequest": TestWebhookRequest,
    "TestWebhookResponse": TestWebhookResponse,
    "TransformRule": TransformRule,
    "TwoFactorRequiredResponse": TwoFactorRequiredResponse,
    "UpdateEndpointRequest": UpdateEndpointRequest,
    "UpdateNotificationPreferences": UpdateNotificationPreferences,
    "UpdateProfileRequest": UpdateProfileRequest,
    "UpdateRoutingRequest": UpdateRoutingRequest,
    "UpgradeRequest": UpgradeRequest,
    "UpgradeResponse": UpgradeResponse,
    "UsageResponse": UsageResponse,
    "UserSummary": UserSummary,
    "ValidateEventRequest": ValidateEventRequest,
    "Verify2faRequest": Verify2faRequest,
    "VerifyEmailRequest": VerifyEmailRequest,
    "WebhookTemplate": WebhookTemplate,
}

// Check if a string starts with another string without using es6 features
function startsWith(str: string, match: string): boolean {
    return str.substring(0, match.length) === match;
}

// Check if a string ends with another string without using es6 features
function endsWith(str: string, match: string): boolean {
    return str.length >= match.length && str.substring(str.length - match.length) === match;
}

const nullableSuffix = " | null";
const optionalSuffix = " | undefined";
const arrayPrefix = "Array<";
const arraySuffix = ">";
const mapPrefix = "{ [key: string]: ";
const mapSuffix = "; }";

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
            if (enumsMap[expectedType]) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }

            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if(typeMap[discriminatorType]){
                        return discriminatorType; // use the type given in the discriminator
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

    public static serialize(data: any, type: string): any {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (endsWith(type, nullableSuffix)) {
            let subType: string = type.slice(0, -nullableSuffix.length); // Type | null => Type
            return ObjectSerializer.serialize(data, subType);
        } else if (endsWith(type, optionalSuffix)) {
            let subType: string = type.slice(0, -optionalSuffix.length); // Type | undefined => Type
            return ObjectSerializer.serialize(data, subType);
        } else if (startsWith(type, arrayPrefix)) {
            let subType: string = type.slice(arrayPrefix.length, -arraySuffix.length); // Array<Type> => Type
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.serialize(datum, subType));
            }
            return transformedData;
        } else if (startsWith(type, mapPrefix)) {
            let subType: string = type.slice(mapPrefix.length, -mapSuffix.length); // { [key: string]: Type; } => Type
            let transformedData: { [key: string]: any } = {};
            for (let key in data) {
                transformedData[key] = ObjectSerializer.serialize(
                    data[key],
                    subType,
                );
            }
            return transformedData;
        } else if (type === "Date") {
            return data.toISOString();
        } else {
            if (enumsMap[type]) {
                return data;
            }
            if (!typeMap[type]) { // in case we dont know the type
                return data;
            }

            // Get the actual type of this object
            type = this.findCorrectType(data, type);

            // get the map for the correct type.
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance: {[index: string]: any} = {};
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
            }
            return instance;
        }
    }

    public static deserialize(data: any, type: string): any {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (endsWith(type, nullableSuffix)) {
            let subType: string = type.slice(0, -nullableSuffix.length); // Type | null => Type
            return ObjectSerializer.deserialize(data, subType);
        } else if (endsWith(type, optionalSuffix)) {
            let subType: string = type.slice(0, -optionalSuffix.length); // Type | undefined => Type
            return ObjectSerializer.deserialize(data, subType);
        } else if (startsWith(type, arrayPrefix)) {
            let subType: string = type.slice(arrayPrefix.length, -arraySuffix.length); // Array<Type> => Type
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.deserialize(datum, subType));
            }
            return transformedData;
        } else if (startsWith(type, mapPrefix)) {
            let subType: string = type.slice(mapPrefix.length, -mapSuffix.length); // { [key: string]: Type; } => Type
            let transformedData: { [key: string]: any } = {};
            for (let key in data) {
                transformedData[key] = ObjectSerializer.deserialize(
                    data[key],
                    subType,
                );
            }
            return transformedData;
        } else if (type === "Date") {
            return new Date(data);
        } else {
            if (enumsMap[type]) {// is Enum
                return data;
            }

            if (!typeMap[type]) { // dont know the type
                return data;
            }
            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.name] = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type);
            }
            return instance;
        }
    }
}

export interface Authentication {
    /**
    * Apply authentication settings to header and query params.
    */
    applyToRequest(requestOptions: localVarRequest.Options): Promise<void> | void;
}

export class HttpBasicAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        requestOptions.auth = {
            username: this.username, password: this.password
        }
    }
}

export class HttpBearerAuth implements Authentication {
    public accessToken: string | (() => string) = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            const accessToken = typeof this.accessToken === 'function'
                            ? this.accessToken()
                            : this.accessToken;
            requestOptions.headers["Authorization"] = "Bearer " + accessToken;
        }
    }
}

export class ApiKeyAuth implements Authentication {
    public apiKey: string = '';

    constructor(private location: string, private paramName: string) {
    }

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (this.location == "query") {
            (<any>requestOptions.qs)[this.paramName] = this.apiKey;
        } else if (this.location == "header" && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        } else if (this.location == 'cookie' && requestOptions && requestOptions.headers) {
            if (requestOptions.headers['Cookie']) {
                requestOptions.headers['Cookie'] += '; ' + this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
            else {
                requestOptions.headers['Cookie'] = this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
        }
    }
}

export class OAuth implements Authentication {
    public accessToken: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}

export class VoidAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(_: localVarRequest.Options): void {
        // Do nothing
    }
}

export type Interceptor = (requestOptions: localVarRequest.Options) => (Promise<void> | void);
