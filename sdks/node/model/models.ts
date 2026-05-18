import localVarRequest from 'request';

export * from './adminAlertRule';
export * from './adminAlertsIdDelete200Response';
export * from './adminAuditEntry';
export * from './adminAuditLogResponse';
export * from './adminCreateAlertRequest';
export * from './adminFeatureFlagsGet200Response';
export * from './adminFeatureFlagsIdPutRequest';
export * from './adminFeatureFlagsPostRequest';
export * from './adminRevenueEntry';
export * from './adminRevenueResponse';
export * from './adminSdkUpdatePostRequest';
export * from './adminSettingsPut200Response';
export * from './adminSystemStatus';
export * from './adminTestWebhookRequest';
export * from './adminTestWebhookResponse';
export * from './adminUpdateAlertRequest';
export * from './adminUserListResponse';
export * from './adminUsersIdGet200Response';
export * from './adminUsersIdGet200ResponseEndpointsInner';
export * from './adminUsersIdGet200ResponseRecentDeliveriesInner';
export * from './adminUsersIdGet200ResponseUsageStats';
export * from './adminUsersIdPlanPutRequest';
export * from './adminUsersIdStatusPutRequest';
export * from './alertNotificationListResponse';
export * from './alertNotificationListResponseDataInner';
export * from './alertRule';
export * from './alertRuleListResponse';
export * from './analyticsTrendPoint';
export * from './analyticsTrendResponse';
export * from './apiKeyInfo';
export * from './application';
export * from './applicationsIdPutRequest';
export * from './applicationsPostRequest';
export * from './applyTemplateRequest';
export * from './applyTemplateResponse';
export * from './auditLogEntry';
export * from './auditLogListResponse';
export * from './auth2faEnablePost200Response';
export * from './auth2faStatusGet200Response';
export * from './authConsentGet200Response';
export * from './authConsentPost200Response';
export * from './authConsentPostRequest';
export * from './authLoginPost200Response';
export * from './authResponse';
export * from './batchReplayRequest';
export * from './batchResponse';
export * from './batchResponseErrorsInner';
export * from './batchWebhookRequest';
export * from './batchWebhookResponse';
export * from './billingPortalPost200Response';
export * from './billingPortalResponse';
export * from './cancelSubscriptionRequest';
export * from './cancelSubscriptionResponse';
export * from './changePasswordRequest';
export * from './changeRoleRequest';
export * from './churnResponse';
export * from './churnedUser';
export * from './confirm2faRequest';
export * from './contactRequest';
export * from './contactResponse';
export * from './createAlertRequest';
export * from './createAlertRuleRequest';
export * from './createApiKeyResponse';
export * from './createCustomDomainRequest';
export * from './createEndpointRequest';
export * from './createRoutingRuleRequest';
export * from './createSSOConfigRequest';
export * from './createTeamRequest';
export * from './createTransformRuleRequest';
export * from './createWebhookRequest';
export * from './customDomain';
export * from './customDomainListResponse';
export * from './customDomainsPostRequest';
export * from './customerResponse';
export * from './dailyDeliveryCount';
export * from './delivery';
export * from './deliveryAttempt';
export * from './deliveryAttemptListResponse';
export * from './deliveryDetailResponse';
export * from './deliveryListResponse';
export * from './deliveryTrendResponse';
export * from './deliveryTrendResponseBucketsInner';
export * from './deployInfo';
export * from './deviceListResponse';
export * from './deviceTokenResponse';
export * from './disable2faRequest';
export * from './domainDnsRecord';
export * from './embedConfig';
export * from './embedConfigTheme';
export * from './enable2faRequest';
export * from './enable2faResponse';
export * from './endpoint';
export * from './endpointHealth';
export * from './endpointListResponse';
export * from './endpointsEndpointIdTransformsTestPostRequest';
export * from './endpointsIdRotateSecretPost200Response';
export * from './eventType';
export * from './eventTypeCount';
export * from './eventTypeListResponse';
export * from './exportDataResponse';
export * from './featureFlag';
export * from './forgotPasswordRequest';
export * from './inboundConfig';
export * from './inboundConfigsIdPutRequest';
export * from './inboundConfigsPostRequest';
export * from './inboundWebhookRequest';
export * from './inboundWebhookResponse';
export * from './inviteMemberRequest';
export * from './inviteRequest';
export * from './invoiceListResponse';
export * from './invoiceResponse';
export * from './latencyResponse';
export * from './latencyTrendResponse';
export * from './latencyTrendResponseBucketsInner';
export * from './loginRequest';
export * from './logoutRequest';
export * from './modelError';
export * from './notification';
export * from './notificationListResponse';
export * from './notificationPreferences';
export * from './notificationsUnreadCountGet200Response';
export * from './oAuthCallbackRequest';
export * from './oAuthLoginRedirect';
export * from './oAuthProvider';
export * from './oAuthProviderListResponse';
export * from './outboundIPsResponse';
export * from './outboundIpsResponse';
export * from './paginatedUsers';
export * from './platformSettings';
export * from './playgroundGet200Response';
export * from './playgroundTestRequest';
export * from './playgroundTestResponse';
export * from './portalConfig';
export * from './portalNotificationsPut200Response';
export * from './portalProfile';
export * from './portalSession';
export * from './rateLimitConfig';
export * from './rateLimitUsage';
export * from './refreshTokenRequest';
export * from './registerDeviceRequest';
export * from './registerRequest';
export * from './registerSchemaRequest';
export * from './replayDeliveryResponse';
export * from './resendVerificationRequest';
export * from './resetPasswordRequest';
export * from './retryPolicy';
export * from './revenueResponse';
export * from './revenueResponseMonthlyRevenueInner';
export * from './revenueResponseRevenueByPlanInner';
export * from './rotateSecretResponse';
export * from './routingInfo';
export * from './routingRuleListResponse';
export * from './routingRuleListResponseDataInner';
export * from './sSOConfig';
export * from './sSOConfigListResponse';
export * from './schemaListResponse';
export * from './schemaResponse';
export * from './searchRequest';
export * from './searchRequestFilters';
export * from './searchResponse';
export * from './searchResult';
export * from './serviceToken';
export * from './serviceTokenCreateResponse';
export * from './serviceTokensIdPutRequest';
export * from './serviceTokensIdRevealPost200Response';
export * from './serviceTokensPostRequest';
export * from './simulatorPostRequest';
export * from './simulatorRequest';
export * from './simulatorResponse';
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
export * from './teamListResponse';
export * from './teamMember';
export * from './teamMemberListResponse';
export * from './templateListResponse';
export * from './testWebhookRequest';
export * from './testWebhookResponse';
export * from './transformRule';
export * from './transformRuleListResponse';
export * from './twoFactorRequiredResponse';
export * from './updateAlertRuleRequest';
export * from './updateEndpointRequest';
export * from './updateNotificationPreferences';
export * from './updateProfileRequest';
export * from './updateRoutingRequest';
export * from './updateRoutingRuleRequest';
export * from './updateSSOConfigRequest';
export * from './updateSubscriptionRequest';
export * from './updateTeamRequest';
export * from './updateTransformRuleRequest';
export * from './upgradeRequest';
export * from './upgradeResponse';
export * from './usageResponse';
export * from './usageStatsResponse';
export * from './userAnalytics';
export * from './userSummary';
export * from './validateEventRequest';
export * from './validateEventResponse';
export * from './validateEventResponseErrorsInner';
export * from './verify2faRequest';
export * from './verifyCustomDomainResponse';
export * from './verifyEmailRequest';
export * from './webhookFilter';
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


import { AdminAlertRule } from './adminAlertRule';
import { AdminAlertsIdDelete200Response } from './adminAlertsIdDelete200Response';
import { AdminAuditEntry } from './adminAuditEntry';
import { AdminAuditLogResponse } from './adminAuditLogResponse';
import { AdminCreateAlertRequest } from './adminCreateAlertRequest';
import { AdminFeatureFlagsGet200Response } from './adminFeatureFlagsGet200Response';
import { AdminFeatureFlagsIdPutRequest } from './adminFeatureFlagsIdPutRequest';
import { AdminFeatureFlagsPostRequest } from './adminFeatureFlagsPostRequest';
import { AdminRevenueEntry } from './adminRevenueEntry';
import { AdminRevenueResponse } from './adminRevenueResponse';
import { AdminSdkUpdatePostRequest } from './adminSdkUpdatePostRequest';
import { AdminSettingsPut200Response } from './adminSettingsPut200Response';
import { AdminSystemStatus } from './adminSystemStatus';
import { AdminTestWebhookRequest } from './adminTestWebhookRequest';
import { AdminTestWebhookResponse } from './adminTestWebhookResponse';
import { AdminUpdateAlertRequest } from './adminUpdateAlertRequest';
import { AdminUserListResponse } from './adminUserListResponse';
import { AdminUsersIdGet200Response } from './adminUsersIdGet200Response';
import { AdminUsersIdGet200ResponseEndpointsInner } from './adminUsersIdGet200ResponseEndpointsInner';
import { AdminUsersIdGet200ResponseRecentDeliveriesInner } from './adminUsersIdGet200ResponseRecentDeliveriesInner';
import { AdminUsersIdGet200ResponseUsageStats } from './adminUsersIdGet200ResponseUsageStats';
import { AdminUsersIdPlanPutRequest } from './adminUsersIdPlanPutRequest';
import { AdminUsersIdStatusPutRequest } from './adminUsersIdStatusPutRequest';
import { AlertNotificationListResponse } from './alertNotificationListResponse';
import { AlertNotificationListResponseDataInner } from './alertNotificationListResponseDataInner';
import { AlertRule } from './alertRule';
import { AlertRuleListResponse } from './alertRuleListResponse';
import { AnalyticsTrendPoint } from './analyticsTrendPoint';
import { AnalyticsTrendResponse } from './analyticsTrendResponse';
import { ApiKeyInfo } from './apiKeyInfo';
import { Application } from './application';
import { ApplicationsIdPutRequest } from './applicationsIdPutRequest';
import { ApplicationsPostRequest } from './applicationsPostRequest';
import { ApplyTemplateRequest } from './applyTemplateRequest';
import { ApplyTemplateResponse } from './applyTemplateResponse';
import { AuditLogEntry } from './auditLogEntry';
import { AuditLogListResponse } from './auditLogListResponse';
import { Auth2faEnablePost200Response } from './auth2faEnablePost200Response';
import { Auth2faStatusGet200Response } from './auth2faStatusGet200Response';
import { AuthConsentGet200Response } from './authConsentGet200Response';
import { AuthConsentPost200Response } from './authConsentPost200Response';
import { AuthConsentPostRequest } from './authConsentPostRequest';
import { AuthLoginPost200Response } from './authLoginPost200Response';
import { AuthResponse } from './authResponse';
import { BatchReplayRequest } from './batchReplayRequest';
import { BatchResponse } from './batchResponse';
import { BatchResponseErrorsInner } from './batchResponseErrorsInner';
import { BatchWebhookRequest } from './batchWebhookRequest';
import { BatchWebhookResponse } from './batchWebhookResponse';
import { BillingPortalPost200Response } from './billingPortalPost200Response';
import { BillingPortalResponse } from './billingPortalResponse';
import { CancelSubscriptionRequest } from './cancelSubscriptionRequest';
import { CancelSubscriptionResponse } from './cancelSubscriptionResponse';
import { ChangePasswordRequest } from './changePasswordRequest';
import { ChangeRoleRequest } from './changeRoleRequest';
import { ChurnResponse } from './churnResponse';
import { ChurnedUser } from './churnedUser';
import { Confirm2faRequest } from './confirm2faRequest';
import { ContactRequest } from './contactRequest';
import { ContactResponse } from './contactResponse';
import { CreateAlertRequest } from './createAlertRequest';
import { CreateAlertRuleRequest } from './createAlertRuleRequest';
import { CreateApiKeyResponse } from './createApiKeyResponse';
import { CreateCustomDomainRequest } from './createCustomDomainRequest';
import { CreateEndpointRequest } from './createEndpointRequest';
import { CreateRoutingRuleRequest } from './createRoutingRuleRequest';
import { CreateSSOConfigRequest } from './createSSOConfigRequest';
import { CreateTeamRequest } from './createTeamRequest';
import { CreateTransformRuleRequest } from './createTransformRuleRequest';
import { CreateWebhookRequest } from './createWebhookRequest';
import { CustomDomain } from './customDomain';
import { CustomDomainListResponse } from './customDomainListResponse';
import { CustomDomainsPostRequest } from './customDomainsPostRequest';
import { CustomerResponse } from './customerResponse';
import { DailyDeliveryCount } from './dailyDeliveryCount';
import { Delivery } from './delivery';
import { DeliveryAttempt } from './deliveryAttempt';
import { DeliveryAttemptListResponse } from './deliveryAttemptListResponse';
import { DeliveryDetailResponse } from './deliveryDetailResponse';
import { DeliveryListResponse } from './deliveryListResponse';
import { DeliveryTrendResponse } from './deliveryTrendResponse';
import { DeliveryTrendResponseBucketsInner } from './deliveryTrendResponseBucketsInner';
import { DeployInfo } from './deployInfo';
import { DeviceListResponse } from './deviceListResponse';
import { DeviceTokenResponse } from './deviceTokenResponse';
import { Disable2faRequest } from './disable2faRequest';
import { DomainDnsRecord } from './domainDnsRecord';
import { EmbedConfig } from './embedConfig';
import { EmbedConfigTheme } from './embedConfigTheme';
import { Enable2faRequest } from './enable2faRequest';
import { Enable2faResponse } from './enable2faResponse';
import { Endpoint } from './endpoint';
import { EndpointHealth } from './endpointHealth';
import { EndpointListResponse } from './endpointListResponse';
import { EndpointsEndpointIdTransformsTestPostRequest } from './endpointsEndpointIdTransformsTestPostRequest';
import { EndpointsIdRotateSecretPost200Response } from './endpointsIdRotateSecretPost200Response';
import { EventType } from './eventType';
import { EventTypeCount } from './eventTypeCount';
import { EventTypeListResponse } from './eventTypeListResponse';
import { ExportDataResponse } from './exportDataResponse';
import { FeatureFlag } from './featureFlag';
import { ForgotPasswordRequest } from './forgotPasswordRequest';
import { InboundConfig } from './inboundConfig';
import { InboundConfigsIdPutRequest } from './inboundConfigsIdPutRequest';
import { InboundConfigsPostRequest } from './inboundConfigsPostRequest';
import { InboundWebhookRequest } from './inboundWebhookRequest';
import { InboundWebhookResponse } from './inboundWebhookResponse';
import { InviteMemberRequest } from './inviteMemberRequest';
import { InviteRequest } from './inviteRequest';
import { InvoiceListResponse } from './invoiceListResponse';
import { InvoiceResponse } from './invoiceResponse';
import { LatencyResponse } from './latencyResponse';
import { LatencyTrendResponse } from './latencyTrendResponse';
import { LatencyTrendResponseBucketsInner } from './latencyTrendResponseBucketsInner';
import { LoginRequest } from './loginRequest';
import { LogoutRequest } from './logoutRequest';
import { ModelError } from './modelError';
import { Notification } from './notification';
import { NotificationListResponse } from './notificationListResponse';
import { NotificationPreferences } from './notificationPreferences';
import { NotificationsUnreadCountGet200Response } from './notificationsUnreadCountGet200Response';
import { OAuthCallbackRequest } from './oAuthCallbackRequest';
import { OAuthLoginRedirect } from './oAuthLoginRedirect';
import { OAuthProvider } from './oAuthProvider';
import { OAuthProviderListResponse } from './oAuthProviderListResponse';
import { OutboundIPsResponse } from './outboundIPsResponse';
import { OutboundIpsResponse } from './outboundIpsResponse';
import { PaginatedUsers } from './paginatedUsers';
import { PlatformSettings } from './platformSettings';
import { PlaygroundGet200Response } from './playgroundGet200Response';
import { PlaygroundTestRequest } from './playgroundTestRequest';
import { PlaygroundTestResponse } from './playgroundTestResponse';
import { PortalConfig } from './portalConfig';
import { PortalNotificationsPut200Response } from './portalNotificationsPut200Response';
import { PortalProfile } from './portalProfile';
import { PortalSession } from './portalSession';
import { RateLimitConfig } from './rateLimitConfig';
import { RateLimitUsage } from './rateLimitUsage';
import { RefreshTokenRequest } from './refreshTokenRequest';
import { RegisterDeviceRequest } from './registerDeviceRequest';
import { RegisterRequest } from './registerRequest';
import { RegisterSchemaRequest } from './registerSchemaRequest';
import { ReplayDeliveryResponse } from './replayDeliveryResponse';
import { ResendVerificationRequest } from './resendVerificationRequest';
import { ResetPasswordRequest } from './resetPasswordRequest';
import { RetryPolicy } from './retryPolicy';
import { RevenueResponse } from './revenueResponse';
import { RevenueResponseMonthlyRevenueInner } from './revenueResponseMonthlyRevenueInner';
import { RevenueResponseRevenueByPlanInner } from './revenueResponseRevenueByPlanInner';
import { RotateSecretResponse } from './rotateSecretResponse';
import { RoutingInfo } from './routingInfo';
import { RoutingRuleListResponse } from './routingRuleListResponse';
import { RoutingRuleListResponseDataInner } from './routingRuleListResponseDataInner';
import { SSOConfig } from './sSOConfig';
import { SSOConfigListResponse } from './sSOConfigListResponse';
import { SchemaListResponse } from './schemaListResponse';
import { SchemaResponse } from './schemaResponse';
import { SearchRequest } from './searchRequest';
import { SearchRequestFilters } from './searchRequestFilters';
import { SearchResponse } from './searchResponse';
import { SearchResult } from './searchResult';
import { ServiceToken } from './serviceToken';
import { ServiceTokenCreateResponse } from './serviceTokenCreateResponse';
import { ServiceTokensIdPutRequest } from './serviceTokensIdPutRequest';
import { ServiceTokensIdRevealPost200Response } from './serviceTokensIdRevealPost200Response';
import { ServiceTokensPostRequest } from './serviceTokensPostRequest';
import { SimulatorPostRequest } from './simulatorPostRequest';
import { SimulatorRequest } from './simulatorRequest';
import { SimulatorResponse } from './simulatorResponse';
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
import { TeamListResponse } from './teamListResponse';
import { TeamMember } from './teamMember';
import { TeamMemberListResponse } from './teamMemberListResponse';
import { TemplateListResponse } from './templateListResponse';
import { TestWebhookRequest } from './testWebhookRequest';
import { TestWebhookResponse } from './testWebhookResponse';
import { TransformRule } from './transformRule';
import { TransformRuleListResponse } from './transformRuleListResponse';
import { TwoFactorRequiredResponse } from './twoFactorRequiredResponse';
import { UpdateAlertRuleRequest } from './updateAlertRuleRequest';
import { UpdateEndpointRequest } from './updateEndpointRequest';
import { UpdateNotificationPreferences } from './updateNotificationPreferences';
import { UpdateProfileRequest } from './updateProfileRequest';
import { UpdateRoutingRequest } from './updateRoutingRequest';
import { UpdateRoutingRuleRequest } from './updateRoutingRuleRequest';
import { UpdateSSOConfigRequest } from './updateSSOConfigRequest';
import { UpdateSubscriptionRequest } from './updateSubscriptionRequest';
import { UpdateTeamRequest } from './updateTeamRequest';
import { UpdateTransformRuleRequest } from './updateTransformRuleRequest';
import { UpgradeRequest } from './upgradeRequest';
import { UpgradeResponse } from './upgradeResponse';
import { UsageResponse } from './usageResponse';
import { UsageStatsResponse } from './usageStatsResponse';
import { UserAnalytics } from './userAnalytics';
import { UserSummary } from './userSummary';
import { ValidateEventRequest } from './validateEventRequest';
import { ValidateEventResponse } from './validateEventResponse';
import { ValidateEventResponseErrorsInner } from './validateEventResponseErrorsInner';
import { Verify2faRequest } from './verify2faRequest';
import { VerifyCustomDomainResponse } from './verifyCustomDomainResponse';
import { VerifyEmailRequest } from './verifyEmailRequest';
import { WebhookFilter } from './webhookFilter';
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
        "AdminAlertRule.ConditionEnum": AdminAlertRule.ConditionEnum,
        "AdminAlertRule.ChannelsEnum": AdminAlertRule.ChannelsEnum,
        "AdminCreateAlertRequest.ConditionEnum": AdminCreateAlertRequest.ConditionEnum,
        "AdminCreateAlertRequest.ChannelsEnum": AdminCreateAlertRequest.ChannelsEnum,
        "AdminSystemStatus.DbStatusEnum": AdminSystemStatus.DbStatusEnum,
        "AdminSystemStatus.RedisStatusEnum": AdminSystemStatus.RedisStatusEnum,
        "AdminUpdateAlertRequest.ConditionEnum": AdminUpdateAlertRequest.ConditionEnum,
        "AdminUpdateAlertRequest.ChannelsEnum": AdminUpdateAlertRequest.ChannelsEnum,
        "AdminUsersIdPlanPutRequest.PlanEnum": AdminUsersIdPlanPutRequest.PlanEnum,
        "AlertNotificationListResponseDataInner.StatusEnum": AlertNotificationListResponseDataInner.StatusEnum,
        "AlertRule.ConditionEnum": AlertRule.ConditionEnum,
        "AlertRule.ChannelsEnum": AlertRule.ChannelsEnum,
        "AnalyticsTrendResponse.PeriodEnum": AnalyticsTrendResponse.PeriodEnum,
        "ChangeRoleRequest.RoleEnum": ChangeRoleRequest.RoleEnum,
        "CreateAlertRequest.ConditionEnum": CreateAlertRequest.ConditionEnum,
        "CreateAlertRuleRequest.ConditionEnum": CreateAlertRuleRequest.ConditionEnum,
        "CreateAlertRuleRequest.ChannelsEnum": CreateAlertRuleRequest.ChannelsEnum,
        "CreateEndpointRequest.RoutingStrategyEnum": CreateEndpointRequest.RoutingStrategyEnum,
        "CreateEndpointRequest.FormatEnum": CreateEndpointRequest.FormatEnum,
        "CreateSSOConfigRequest.ProviderEnum": CreateSSOConfigRequest.ProviderEnum,
        "CustomDomain.StatusEnum": CustomDomain.StatusEnum,
        "CustomerResponse.PlanEnum": CustomerResponse.PlanEnum,
        "Delivery.StatusEnum": Delivery.StatusEnum,
        "DomainDnsRecord.TypeEnum": DomainDnsRecord.TypeEnum,
        "DomainDnsRecord.StatusEnum": DomainDnsRecord.StatusEnum,
        "Endpoint.RoutingStrategyEnum": Endpoint.RoutingStrategyEnum,
        "Endpoint.FormatEnum": Endpoint.FormatEnum,
        "InboundWebhookResponse.StatusEnum": InboundWebhookResponse.StatusEnum,
        "InviteMemberRequest.RoleEnum": InviteMemberRequest.RoleEnum,
        "InviteRequest.RoleEnum": InviteRequest.RoleEnum,
        "LatencyResponse.PeriodEnum": LatencyResponse.PeriodEnum,
        "RegisterDeviceRequest.PlatformEnum": RegisterDeviceRequest.PlatformEnum,
        "RetryPolicy.BackoffEnum": RetryPolicy.BackoffEnum,
        "SSOConfig.ProviderEnum": SSOConfig.ProviderEnum,
        "SimulatorResponse.StatusEnum": SimulatorResponse.StatusEnum,
        "SsoConfigPostRequest.ProviderEnum": SsoConfigPostRequest.ProviderEnum,
        "StreamParams.StatusEnum": StreamParams.StatusEnum,
        "SystemStatus.OverallStatusEnum": SystemStatus.OverallStatusEnum,
        "UpdateAlertRuleRequest.ConditionEnum": UpdateAlertRuleRequest.ConditionEnum,
        "UpdateAlertRuleRequest.ChannelsEnum": UpdateAlertRuleRequest.ChannelsEnum,
        "UpdateEndpointRequest.RoutingStrategyEnum": UpdateEndpointRequest.RoutingStrategyEnum,
        "UpdateEndpointRequest.FormatEnum": UpdateEndpointRequest.FormatEnum,
        "UpdateRoutingRequest.RoutingStrategyEnum": UpdateRoutingRequest.RoutingStrategyEnum,
        "UpdateSSOConfigRequest.ProviderEnum": UpdateSSOConfigRequest.ProviderEnum,
        "UpdateSubscriptionRequest.PlanEnum": UpdateSubscriptionRequest.PlanEnum,
        "UpgradeRequest.PlanEnum": UpgradeRequest.PlanEnum,
        "UpgradeRequest.ProviderEnum": UpgradeRequest.ProviderEnum,
        "VerifyCustomDomainResponse.StatusEnum": VerifyCustomDomainResponse.StatusEnum,
        "WebhookFilter.StatusEnum": WebhookFilter.StatusEnum,
}

let typeMap: {[index: string]: any} = {
    "AdminAlertRule": AdminAlertRule,
    "AdminAlertsIdDelete200Response": AdminAlertsIdDelete200Response,
    "AdminAuditEntry": AdminAuditEntry,
    "AdminAuditLogResponse": AdminAuditLogResponse,
    "AdminCreateAlertRequest": AdminCreateAlertRequest,
    "AdminFeatureFlagsGet200Response": AdminFeatureFlagsGet200Response,
    "AdminFeatureFlagsIdPutRequest": AdminFeatureFlagsIdPutRequest,
    "AdminFeatureFlagsPostRequest": AdminFeatureFlagsPostRequest,
    "AdminRevenueEntry": AdminRevenueEntry,
    "AdminRevenueResponse": AdminRevenueResponse,
    "AdminSdkUpdatePostRequest": AdminSdkUpdatePostRequest,
    "AdminSettingsPut200Response": AdminSettingsPut200Response,
    "AdminSystemStatus": AdminSystemStatus,
    "AdminTestWebhookRequest": AdminTestWebhookRequest,
    "AdminTestWebhookResponse": AdminTestWebhookResponse,
    "AdminUpdateAlertRequest": AdminUpdateAlertRequest,
    "AdminUserListResponse": AdminUserListResponse,
    "AdminUsersIdGet200Response": AdminUsersIdGet200Response,
    "AdminUsersIdGet200ResponseEndpointsInner": AdminUsersIdGet200ResponseEndpointsInner,
    "AdminUsersIdGet200ResponseRecentDeliveriesInner": AdminUsersIdGet200ResponseRecentDeliveriesInner,
    "AdminUsersIdGet200ResponseUsageStats": AdminUsersIdGet200ResponseUsageStats,
    "AdminUsersIdPlanPutRequest": AdminUsersIdPlanPutRequest,
    "AdminUsersIdStatusPutRequest": AdminUsersIdStatusPutRequest,
    "AlertNotificationListResponse": AlertNotificationListResponse,
    "AlertNotificationListResponseDataInner": AlertNotificationListResponseDataInner,
    "AlertRule": AlertRule,
    "AlertRuleListResponse": AlertRuleListResponse,
    "AnalyticsTrendPoint": AnalyticsTrendPoint,
    "AnalyticsTrendResponse": AnalyticsTrendResponse,
    "ApiKeyInfo": ApiKeyInfo,
    "Application": Application,
    "ApplicationsIdPutRequest": ApplicationsIdPutRequest,
    "ApplicationsPostRequest": ApplicationsPostRequest,
    "ApplyTemplateRequest": ApplyTemplateRequest,
    "ApplyTemplateResponse": ApplyTemplateResponse,
    "AuditLogEntry": AuditLogEntry,
    "AuditLogListResponse": AuditLogListResponse,
    "Auth2faEnablePost200Response": Auth2faEnablePost200Response,
    "Auth2faStatusGet200Response": Auth2faStatusGet200Response,
    "AuthConsentGet200Response": AuthConsentGet200Response,
    "AuthConsentPost200Response": AuthConsentPost200Response,
    "AuthConsentPostRequest": AuthConsentPostRequest,
    "AuthLoginPost200Response": AuthLoginPost200Response,
    "AuthResponse": AuthResponse,
    "BatchReplayRequest": BatchReplayRequest,
    "BatchResponse": BatchResponse,
    "BatchResponseErrorsInner": BatchResponseErrorsInner,
    "BatchWebhookRequest": BatchWebhookRequest,
    "BatchWebhookResponse": BatchWebhookResponse,
    "BillingPortalPost200Response": BillingPortalPost200Response,
    "BillingPortalResponse": BillingPortalResponse,
    "CancelSubscriptionRequest": CancelSubscriptionRequest,
    "CancelSubscriptionResponse": CancelSubscriptionResponse,
    "ChangePasswordRequest": ChangePasswordRequest,
    "ChangeRoleRequest": ChangeRoleRequest,
    "ChurnResponse": ChurnResponse,
    "ChurnedUser": ChurnedUser,
    "Confirm2faRequest": Confirm2faRequest,
    "ContactRequest": ContactRequest,
    "ContactResponse": ContactResponse,
    "CreateAlertRequest": CreateAlertRequest,
    "CreateAlertRuleRequest": CreateAlertRuleRequest,
    "CreateApiKeyResponse": CreateApiKeyResponse,
    "CreateCustomDomainRequest": CreateCustomDomainRequest,
    "CreateEndpointRequest": CreateEndpointRequest,
    "CreateRoutingRuleRequest": CreateRoutingRuleRequest,
    "CreateSSOConfigRequest": CreateSSOConfigRequest,
    "CreateTeamRequest": CreateTeamRequest,
    "CreateTransformRuleRequest": CreateTransformRuleRequest,
    "CreateWebhookRequest": CreateWebhookRequest,
    "CustomDomain": CustomDomain,
    "CustomDomainListResponse": CustomDomainListResponse,
    "CustomDomainsPostRequest": CustomDomainsPostRequest,
    "CustomerResponse": CustomerResponse,
    "DailyDeliveryCount": DailyDeliveryCount,
    "Delivery": Delivery,
    "DeliveryAttempt": DeliveryAttempt,
    "DeliveryAttemptListResponse": DeliveryAttemptListResponse,
    "DeliveryDetailResponse": DeliveryDetailResponse,
    "DeliveryListResponse": DeliveryListResponse,
    "DeliveryTrendResponse": DeliveryTrendResponse,
    "DeliveryTrendResponseBucketsInner": DeliveryTrendResponseBucketsInner,
    "DeployInfo": DeployInfo,
    "DeviceListResponse": DeviceListResponse,
    "DeviceTokenResponse": DeviceTokenResponse,
    "Disable2faRequest": Disable2faRequest,
    "DomainDnsRecord": DomainDnsRecord,
    "EmbedConfig": EmbedConfig,
    "EmbedConfigTheme": EmbedConfigTheme,
    "Enable2faRequest": Enable2faRequest,
    "Enable2faResponse": Enable2faResponse,
    "Endpoint": Endpoint,
    "EndpointHealth": EndpointHealth,
    "EndpointListResponse": EndpointListResponse,
    "EndpointsEndpointIdTransformsTestPostRequest": EndpointsEndpointIdTransformsTestPostRequest,
    "EndpointsIdRotateSecretPost200Response": EndpointsIdRotateSecretPost200Response,
    "EventType": EventType,
    "EventTypeCount": EventTypeCount,
    "EventTypeListResponse": EventTypeListResponse,
    "ExportDataResponse": ExportDataResponse,
    "FeatureFlag": FeatureFlag,
    "ForgotPasswordRequest": ForgotPasswordRequest,
    "InboundConfig": InboundConfig,
    "InboundConfigsIdPutRequest": InboundConfigsIdPutRequest,
    "InboundConfigsPostRequest": InboundConfigsPostRequest,
    "InboundWebhookRequest": InboundWebhookRequest,
    "InboundWebhookResponse": InboundWebhookResponse,
    "InviteMemberRequest": InviteMemberRequest,
    "InviteRequest": InviteRequest,
    "InvoiceListResponse": InvoiceListResponse,
    "InvoiceResponse": InvoiceResponse,
    "LatencyResponse": LatencyResponse,
    "LatencyTrendResponse": LatencyTrendResponse,
    "LatencyTrendResponseBucketsInner": LatencyTrendResponseBucketsInner,
    "LoginRequest": LoginRequest,
    "LogoutRequest": LogoutRequest,
    "ModelError": ModelError,
    "Notification": Notification,
    "NotificationListResponse": NotificationListResponse,
    "NotificationPreferences": NotificationPreferences,
    "NotificationsUnreadCountGet200Response": NotificationsUnreadCountGet200Response,
    "OAuthCallbackRequest": OAuthCallbackRequest,
    "OAuthLoginRedirect": OAuthLoginRedirect,
    "OAuthProvider": OAuthProvider,
    "OAuthProviderListResponse": OAuthProviderListResponse,
    "OutboundIPsResponse": OutboundIPsResponse,
    "OutboundIpsResponse": OutboundIpsResponse,
    "PaginatedUsers": PaginatedUsers,
    "PlatformSettings": PlatformSettings,
    "PlaygroundGet200Response": PlaygroundGet200Response,
    "PlaygroundTestRequest": PlaygroundTestRequest,
    "PlaygroundTestResponse": PlaygroundTestResponse,
    "PortalConfig": PortalConfig,
    "PortalNotificationsPut200Response": PortalNotificationsPut200Response,
    "PortalProfile": PortalProfile,
    "PortalSession": PortalSession,
    "RateLimitConfig": RateLimitConfig,
    "RateLimitUsage": RateLimitUsage,
    "RefreshTokenRequest": RefreshTokenRequest,
    "RegisterDeviceRequest": RegisterDeviceRequest,
    "RegisterRequest": RegisterRequest,
    "RegisterSchemaRequest": RegisterSchemaRequest,
    "ReplayDeliveryResponse": ReplayDeliveryResponse,
    "ResendVerificationRequest": ResendVerificationRequest,
    "ResetPasswordRequest": ResetPasswordRequest,
    "RetryPolicy": RetryPolicy,
    "RevenueResponse": RevenueResponse,
    "RevenueResponseMonthlyRevenueInner": RevenueResponseMonthlyRevenueInner,
    "RevenueResponseRevenueByPlanInner": RevenueResponseRevenueByPlanInner,
    "RotateSecretResponse": RotateSecretResponse,
    "RoutingInfo": RoutingInfo,
    "RoutingRuleListResponse": RoutingRuleListResponse,
    "RoutingRuleListResponseDataInner": RoutingRuleListResponseDataInner,
    "SSOConfig": SSOConfig,
    "SSOConfigListResponse": SSOConfigListResponse,
    "SchemaListResponse": SchemaListResponse,
    "SchemaResponse": SchemaResponse,
    "SearchRequest": SearchRequest,
    "SearchRequestFilters": SearchRequestFilters,
    "SearchResponse": SearchResponse,
    "SearchResult": SearchResult,
    "ServiceToken": ServiceToken,
    "ServiceTokenCreateResponse": ServiceTokenCreateResponse,
    "ServiceTokensIdPutRequest": ServiceTokensIdPutRequest,
    "ServiceTokensIdRevealPost200Response": ServiceTokensIdRevealPost200Response,
    "ServiceTokensPostRequest": ServiceTokensPostRequest,
    "SimulatorPostRequest": SimulatorPostRequest,
    "SimulatorRequest": SimulatorRequest,
    "SimulatorResponse": SimulatorResponse,
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
    "TeamListResponse": TeamListResponse,
    "TeamMember": TeamMember,
    "TeamMemberListResponse": TeamMemberListResponse,
    "TemplateListResponse": TemplateListResponse,
    "TestWebhookRequest": TestWebhookRequest,
    "TestWebhookResponse": TestWebhookResponse,
    "TransformRule": TransformRule,
    "TransformRuleListResponse": TransformRuleListResponse,
    "TwoFactorRequiredResponse": TwoFactorRequiredResponse,
    "UpdateAlertRuleRequest": UpdateAlertRuleRequest,
    "UpdateEndpointRequest": UpdateEndpointRequest,
    "UpdateNotificationPreferences": UpdateNotificationPreferences,
    "UpdateProfileRequest": UpdateProfileRequest,
    "UpdateRoutingRequest": UpdateRoutingRequest,
    "UpdateRoutingRuleRequest": UpdateRoutingRuleRequest,
    "UpdateSSOConfigRequest": UpdateSSOConfigRequest,
    "UpdateSubscriptionRequest": UpdateSubscriptionRequest,
    "UpdateTeamRequest": UpdateTeamRequest,
    "UpdateTransformRuleRequest": UpdateTransformRuleRequest,
    "UpgradeRequest": UpgradeRequest,
    "UpgradeResponse": UpgradeResponse,
    "UsageResponse": UsageResponse,
    "UsageStatsResponse": UsageStatsResponse,
    "UserAnalytics": UserAnalytics,
    "UserSummary": UserSummary,
    "ValidateEventRequest": ValidateEventRequest,
    "ValidateEventResponse": ValidateEventResponse,
    "ValidateEventResponseErrorsInner": ValidateEventResponseErrorsInner,
    "Verify2faRequest": Verify2faRequest,
    "VerifyCustomDomainResponse": VerifyCustomDomainResponse,
    "VerifyEmailRequest": VerifyEmailRequest,
    "WebhookFilter": WebhookFilter,
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
