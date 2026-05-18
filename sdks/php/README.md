# hooksniff

Webhook delivery, monitoring, and management API.
All endpoints under `/v1` require authentication via `Authorization: Bearer <api_key>` header
unless marked as **Public**.


For more information, please visit [https://hooksniff.vercel.app](https://hooksniff.vercel.app).

## Installation & Usage

### Requirements

PHP 8.1 and later.

### Composer

To install the bindings via [Composer](https://getcomposer.org/), add the following to `composer.json`:

```json
{
  "repositories": [
    {
      "type": "vcs",
      "url": "https://github.com/GIT_USER_ID/GIT_REPO_ID.git"
    }
  ],
  "require": {
    "GIT_USER_ID/GIT_REPO_ID": "*@dev"
  }
}
```

Then run `composer install`

### Manual Installation

Download the files and include `autoload.php`:

```php
<?php
require_once('/path/to/hooksniff/vendor/autoload.php');
```

## Getting Started

Please follow the [installation procedure](#installation--usage) and then run the following:

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');



// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\APIKeysApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->apiKeysGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling APIKeysApi->apiKeysGet: ', $e->getMessage(), PHP_EOL;
}

```

## API Endpoints

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*APIKeysApi* | [**apiKeysGet**](docs/Api/APIKeysApi.md#apikeysget) | **GET** /api-keys | List API keys
*APIKeysApi* | [**apiKeysIdDelete**](docs/Api/APIKeysApi.md#apikeysiddelete) | **DELETE** /api-keys/{id} | Delete (revoke) an API key
*APIKeysApi* | [**apiKeysIdRotatePost**](docs/Api/APIKeysApi.md#apikeysidrotatepost) | **POST** /api-keys/{id}/rotate | Rotate an API key
*APIKeysApi* | [**apiKeysPost**](docs/Api/APIKeysApi.md#apikeyspost) | **POST** /api-keys | Create a new API key
*AdminApi* | [**adminAlertsGet**](docs/Api/AdminApi.md#adminalertsget) | **GET** /admin/alerts | List all alert rules (admin)
*AdminApi* | [**adminAlertsIdDelete**](docs/Api/AdminApi.md#adminalertsiddelete) | **DELETE** /admin/alerts/{id} | Delete an alert rule (admin)
*AdminApi* | [**adminAlertsIdPut**](docs/Api/AdminApi.md#adminalertsidput) | **PUT** /admin/alerts/{id} | Update an alert rule (admin)
*AdminApi* | [**adminAlertsPost**](docs/Api/AdminApi.md#adminalertspost) | **POST** /admin/alerts | Create a platform alert rule (admin)
*AdminApi* | [**adminAuditLogsGet**](docs/Api/AdminApi.md#adminauditlogsget) | **GET** /admin/audit-logs | List audit logs (admin)
*AdminApi* | [**adminChurnGet**](docs/Api/AdminApi.md#adminchurnget) | **GET** /admin/churn | Get churn metrics (admin)
*AdminApi* | [**adminDeliveriesIdReplayPost**](docs/Api/AdminApi.md#admindeliveriesidreplaypost) | **POST** /admin/deliveries/{id}/replay | Replay a delivery (admin)
*AdminApi* | [**adminDeployInfoGet**](docs/Api/AdminApi.md#admindeployinfoget) | **GET** /admin/deploy-info | Get deploy info
*AdminApi* | [**adminFeatureFlagsGet**](docs/Api/AdminApi.md#adminfeatureflagsget) | **GET** /admin/feature-flags | List feature flags
*AdminApi* | [**adminFeatureFlagsIdDelete**](docs/Api/AdminApi.md#adminfeatureflagsiddelete) | **DELETE** /admin/feature-flags/{id} | Delete feature flag
*AdminApi* | [**adminFeatureFlagsIdPut**](docs/Api/AdminApi.md#adminfeatureflagsidput) | **PUT** /admin/feature-flags/{id} | Update feature flag
*AdminApi* | [**adminFeatureFlagsPost**](docs/Api/AdminApi.md#adminfeatureflagspost) | **POST** /admin/feature-flags | Create feature flag
*AdminApi* | [**adminRevenueExportGet**](docs/Api/AdminApi.md#adminrevenueexportget) | **GET** /admin/revenue/export | Export revenue data as CSV (admin)
*AdminApi* | [**adminRevenueGet**](docs/Api/AdminApi.md#adminrevenueget) | **GET** /admin/revenue | Revenue analytics (admin)
*AdminApi* | [**adminSdkUpdatePost**](docs/Api/AdminApi.md#adminsdkupdatepost) | **POST** /admin/sdk-update | Send SDK update notification to users
*AdminApi* | [**adminSettingsGet**](docs/Api/AdminApi.md#adminsettingsget) | **GET** /admin/settings | Get platform settings (admin)
*AdminApi* | [**adminSettingsPut**](docs/Api/AdminApi.md#adminsettingsput) | **PUT** /admin/settings | Update platform settings (admin)
*AdminApi* | [**adminStatsGet**](docs/Api/AdminApi.md#adminstatsget) | **GET** /admin/stats | System-wide statistics (admin)
*AdminApi* | [**adminTestWebhookPost**](docs/Api/AdminApi.md#admintestwebhookpost) | **POST** /admin/test-webhook | Send a test webhook to a URL (admin)
*AdminApi* | [**adminUsersExportGet**](docs/Api/AdminApi.md#adminusersexportget) | **GET** /admin/users/export | Export users as CSV (admin)
*AdminApi* | [**adminUsersGet**](docs/Api/AdminApi.md#adminusersget) | **GET** /admin/users | List all users (admin)
*AdminApi* | [**adminUsersIdAnalyticsGet**](docs/Api/AdminApi.md#adminusersidanalyticsget) | **GET** /admin/users/{id}/analytics | Get user analytics (admin)
*AdminApi* | [**adminUsersIdGet**](docs/Api/AdminApi.md#adminusersidget) | **GET** /admin/users/{id} | Get user details (admin)
*AdminApi* | [**adminUsersIdPlanPut**](docs/Api/AdminApi.md#adminusersidplanput) | **PUT** /admin/users/{id}/plan | Change user plan (admin)
*AdminApi* | [**adminUsersIdStatusPut**](docs/Api/AdminApi.md#adminusersidstatusput) | **PUT** /admin/users/{id}/status | Change user status (admin)
*AlertsApi* | [**alertsGet**](docs/Api/AlertsApi.md#alertsget) | **GET** /alerts | List alert rules
*AlertsApi* | [**alertsIdDelete**](docs/Api/AlertsApi.md#alertsiddelete) | **DELETE** /alerts/{id} | Delete alert rule
*AlertsApi* | [**alertsIdGet**](docs/Api/AlertsApi.md#alertsidget) | **GET** /alerts/{id} | Get alert rule
*AlertsApi* | [**alertsIdTestPost**](docs/Api/AlertsApi.md#alertsidtestpost) | **POST** /alerts/{id}/test | Test an alert rule
*AlertsApi* | [**alertsPost**](docs/Api/AlertsApi.md#alertspost) | **POST** /alerts | Create alert rule
*AnalyticsApi* | [**analyticsDeliveriesGet**](docs/Api/AnalyticsApi.md#analyticsdeliveriesget) | **GET** /analytics/deliveries | Delivery trend over time
*AnalyticsApi* | [**analyticsLatencyGet**](docs/Api/AnalyticsApi.md#analyticslatencyget) | **GET** /analytics/latency | Latency trend over time
*AnalyticsApi* | [**analyticsSuccessRateGet**](docs/Api/AnalyticsApi.md#analyticssuccessrateget) | **GET** /analytics/success-rate | Success rate metrics
*ApplicationsApi* | [**applicationsGet**](docs/Api/ApplicationsApi.md#applicationsget) | **GET** /applications | List applications
*ApplicationsApi* | [**applicationsIdDelete**](docs/Api/ApplicationsApi.md#applicationsiddelete) | **DELETE** /applications/{id} | Delete application
*ApplicationsApi* | [**applicationsIdGet**](docs/Api/ApplicationsApi.md#applicationsidget) | **GET** /applications/{id} | Get application
*ApplicationsApi* | [**applicationsIdPut**](docs/Api/ApplicationsApi.md#applicationsidput) | **PUT** /applications/{id} | Update application
*ApplicationsApi* | [**applicationsPost**](docs/Api/ApplicationsApi.md#applicationspost) | **POST** /applications | Create application
*AuditLogApi* | [**auditLogGet**](docs/Api/AuditLogApi.md#auditlogget) | **GET** /audit-log | List audit log entries
*AuditLogApi* | [**auditLogIdGet**](docs/Api/AuditLogApi.md#auditlogidget) | **GET** /audit-log/{id} | Get audit entry detail
*AuthApi* | [**auth2faConfirmPost**](docs/Api/AuthApi.md#auth2faconfirmpost) | **POST** /auth/2fa/confirm | Confirm 2FA setup with a code
*AuthApi* | [**auth2faDisablePost**](docs/Api/AuthApi.md#auth2fadisablepost) | **POST** /auth/2fa/disable | Disable 2FA
*AuthApi* | [**auth2faEnablePost**](docs/Api/AuthApi.md#auth2faenablepost) | **POST** /auth/2fa/enable | Enable 2FA (returns TOTP secret and QR URL)
*AuthApi* | [**auth2faStatusGet**](docs/Api/AuthApi.md#auth2fastatusget) | **GET** /auth/2fa/status | Get 2FA status
*AuthApi* | [**auth2faVerifyPost**](docs/Api/AuthApi.md#auth2faverifypost) | **POST** /auth/2fa/verify | Verify 2FA code during login
*AuthApi* | [**authAccountDelete**](docs/Api/AuthApi.md#authaccountdelete) | **DELETE** /auth/account | Delete account (GDPR)
*AuthApi* | [**authConsentGet**](docs/Api/AuthApi.md#authconsentget) | **GET** /auth/consent | Get consent preferences
*AuthApi* | [**authConsentPost**](docs/Api/AuthApi.md#authconsentpost) | **POST** /auth/consent | Update a consent preference
*AuthApi* | [**authExportGet**](docs/Api/AuthApi.md#authexportget) | **GET** /auth/export | Export user data (GDPR)
*AuthApi* | [**authForgotPasswordPost**](docs/Api/AuthApi.md#authforgotpasswordpost) | **POST** /auth/forgot-password | Request password reset email
*AuthApi* | [**authLoginPost**](docs/Api/AuthApi.md#authloginpost) | **POST** /auth/login | Login with email and password
*AuthApi* | [**authLogoutPost**](docs/Api/AuthApi.md#authlogoutpost) | **POST** /auth/logout | Logout (invalidate refresh token)
*AuthApi* | [**authMeGet**](docs/Api/AuthApi.md#authmeget) | **GET** /auth/me | Get current user profile
*AuthApi* | [**authPasswordPut**](docs/Api/AuthApi.md#authpasswordput) | **PUT** /auth/password | Change password
*AuthApi* | [**authProfilePut**](docs/Api/AuthApi.md#authprofileput) | **PUT** /auth/profile | Update profile
*AuthApi* | [**authRefreshPost**](docs/Api/AuthApi.md#authrefreshpost) | **POST** /auth/refresh | Refresh access token
*AuthApi* | [**authRegisterPost**](docs/Api/AuthApi.md#authregisterpost) | **POST** /auth/register | Register a new account
*AuthApi* | [**authResendVerificationPost**](docs/Api/AuthApi.md#authresendverificationpost) | **POST** /auth/resend-verification | Resend verification email
*AuthApi* | [**authResetPasswordPost**](docs/Api/AuthApi.md#authresetpasswordpost) | **POST** /auth/reset-password | Reset password with token
*AuthApi* | [**authVerifyEmailPost**](docs/Api/AuthApi.md#authverifyemailpost) | **POST** /auth/verify-email | Verify email address
*BillingApi* | [**billingInvoicesGet**](docs/Api/BillingApi.md#billinginvoicesget) | **GET** /billing/invoices | List invoices
*BillingApi* | [**billingPortalPost**](docs/Api/BillingApi.md#billingportalpost) | **POST** /billing/portal | Open customer billing portal
*BillingApi* | [**billingSubscriptionGet**](docs/Api/BillingApi.md#billingsubscriptionget) | **GET** /billing/subscription | Get current subscription
*BillingApi* | [**billingUpgradePost**](docs/Api/BillingApi.md#billingupgradepost) | **POST** /billing/upgrade | Upgrade plan
*BillingApi* | [**billingUsageGet**](docs/Api/BillingApi.md#billingusageget) | **GET** /billing/usage | Get current usage
*BillingApi* | [**billingWebhookIyzicoPost**](docs/Api/BillingApi.md#billingwebhookiyzicopost) | **POST** /billing/webhook/iyzico | iyzico webhook receiver
*BillingApi* | [**billingWebhookPolarPost**](docs/Api/BillingApi.md#billingwebhookpolarpost) | **POST** /billing/webhook/polar | Polar.sh webhook receiver
*BillingApi* | [**billingWebhookPost**](docs/Api/BillingApi.md#billingwebhookpost) | **POST** /billing/webhook | Stripe webhook receiver
*ContactApi* | [**contactPost**](docs/Api/ContactApi.md#contactpost) | **POST** /contact | Send contact form message
*CustomDomainsApi* | [**customDomainsGet**](docs/Api/CustomDomainsApi.md#customdomainsget) | **GET** /custom-domains | List custom domains
*CustomDomainsApi* | [**customDomainsIdDelete**](docs/Api/CustomDomainsApi.md#customdomainsiddelete) | **DELETE** /custom-domains/{id} | Delete custom domain
*CustomDomainsApi* | [**customDomainsIdVerifyPost**](docs/Api/CustomDomainsApi.md#customdomainsidverifypost) | **POST** /custom-domains/{id}/verify | Verify domain ownership
*CustomDomainsApi* | [**customDomainsPost**](docs/Api/CustomDomainsApi.md#customdomainspost) | **POST** /custom-domains | Add custom domain
*CustomerPortalApi* | [**portalApiKeysGet**](docs/Api/CustomerPortalApi.md#portalapikeysget) | **GET** /portal/api-keys | List API keys (portal)
*CustomerPortalApi* | [**portalApiKeysKeyIdDelete**](docs/Api/CustomerPortalApi.md#portalapikeyskeyiddelete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal)
*CustomerPortalApi* | [**portalApiKeysPost**](docs/Api/CustomerPortalApi.md#portalapikeyspost) | **POST** /portal/api-keys | Create API key (portal)
*CustomerPortalApi* | [**portalConfigGet**](docs/Api/CustomerPortalApi.md#portalconfigget) | **GET** /portal/config | Get portal configuration
*CustomerPortalApi* | [**portalConfigPost**](docs/Api/CustomerPortalApi.md#portalconfigpost) | **POST** /portal/config | Update portal configuration
*CustomerPortalApi* | [**portalEmbedCodeGet**](docs/Api/CustomerPortalApi.md#portalembedcodeget) | **GET** /portal/embed-code | Get portal embed code
*CustomerPortalApi* | [**portalMeGet**](docs/Api/CustomerPortalApi.md#portalmeget) | **GET** /portal/me | Get portal profile
*CustomerPortalApi* | [**portalMePut**](docs/Api/CustomerPortalApi.md#portalmeput) | **PUT** /portal/me | Update portal profile
*CustomerPortalApi* | [**portalNotificationsGet**](docs/Api/CustomerPortalApi.md#portalnotificationsget) | **GET** /portal/notifications | Get notification preferences (portal)
*CustomerPortalApi* | [**portalNotificationsPut**](docs/Api/CustomerPortalApi.md#portalnotificationsput) | **PUT** /portal/notifications | Update notification preferences (portal)
*CustomerPortalApi* | [**portalPlanGet**](docs/Api/CustomerPortalApi.md#portalplanget) | **GET** /portal/plan | Get plan info (portal)
*CustomerPortalApi* | [**portalUsageGet**](docs/Api/CustomerPortalApi.md#portalusageget) | **GET** /portal/usage | Get usage (portal)
*DeliveryDetailsApi* | [**webhooksIdAttemptsAttemptIdGet**](docs/Api/DeliveryDetailsApi.md#webhooksidattemptsattemptidget) | **GET** /webhooks/{id}/attempts/{attempt_id} | Get specific attempt detail
*DeliveryDetailsApi* | [**webhooksIdDetailsGet**](docs/Api/DeliveryDetailsApi.md#webhooksiddetailsget) | **GET** /webhooks/{id}/details | Get detailed delivery info
*DevicesApi* | [**devicesGet**](docs/Api/DevicesApi.md#devicesget) | **GET** /devices | List registered devices
*DevicesApi* | [**devicesPost**](docs/Api/DevicesApi.md#devicespost) | **POST** /devices | Register device for push notifications
*DevicesApi* | [**devicesTokenDelete**](docs/Api/DevicesApi.md#devicestokendelete) | **DELETE** /devices/{token} | Remove device token
*EmbedApi* | [**embedGet**](docs/Api/EmbedApi.md#embedget) | **GET** /embed | Embeddable portal HTML
*EmbedApi* | [**embedScriptGet**](docs/Api/EmbedApi.md#embedscriptget) | **GET** /embed/script | Embeddable portal JavaScript
*EndpointsApi* | [**endpointsGet**](docs/Api/EndpointsApi.md#endpointsget) | **GET** /endpoints | List all endpoints
*EndpointsApi* | [**endpointsIdDelete**](docs/Api/EndpointsApi.md#endpointsiddelete) | **DELETE** /endpoints/{id} | Delete endpoint
*EndpointsApi* | [**endpointsIdGet**](docs/Api/EndpointsApi.md#endpointsidget) | **GET** /endpoints/{id} | Get endpoint by ID
*EndpointsApi* | [**endpointsIdPut**](docs/Api/EndpointsApi.md#endpointsidput) | **PUT** /endpoints/{id} | Update endpoint
*EndpointsApi* | [**endpointsIdRetryPolicyPut**](docs/Api/EndpointsApi.md#endpointsidretrypolicyput) | **PUT** /endpoints/{id}/retry-policy | Update retry policy for an endpoint
*EndpointsApi* | [**endpointsIdRotateSecretPost**](docs/Api/EndpointsApi.md#endpointsidrotatesecretpost) | **POST** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret
*EndpointsApi* | [**endpointsPost**](docs/Api/EndpointsApi.md#endpointspost) | **POST** /endpoints | Create a new endpoint
*EventsApi* | [**eventsGet**](docs/Api/EventsApi.md#eventsget) | **GET** /events | List event types
*HealthApi* | [**endpointHealthGet**](docs/Api/HealthApi.md#endpointhealthget) | **GET** /endpoint-health | List endpoint health statuses
*HealthApi* | [**endpointHealthIdGet**](docs/Api/HealthApi.md#endpointhealthidget) | **GET** /endpoint-health/{id} | Get specific endpoint health
*HealthApi* | [**statusGet**](docs/Api/HealthApi.md#statusget) | **GET** /status | System status (public)
*InboundApi* | [**inboundConfigsGet**](docs/Api/InboundApi.md#inboundconfigsget) | **GET** /inbound/configs | List inbound webhook configs
*InboundApi* | [**inboundConfigsIdDelete**](docs/Api/InboundApi.md#inboundconfigsiddelete) | **DELETE** /inbound/configs/{id} | Delete inbound config
*InboundApi* | [**inboundConfigsIdPut**](docs/Api/InboundApi.md#inboundconfigsidput) | **PUT** /inbound/configs/{id} | Update inbound config
*InboundApi* | [**inboundConfigsPost**](docs/Api/InboundApi.md#inboundconfigspost) | **POST** /inbound/configs | Create inbound webhook config
*InboundApi* | [**inboundProviderEndpointIdPost**](docs/Api/InboundApi.md#inboundproviderendpointidpost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint
*InboundApi* | [**inboundProviderPost**](docs/Api/InboundApi.md#inboundproviderpost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider
*NotificationsApi* | [**notificationsGet**](docs/Api/NotificationsApi.md#notificationsget) | **GET** /notifications | List notifications
*NotificationsApi* | [**notificationsIdDelete**](docs/Api/NotificationsApi.md#notificationsiddelete) | **DELETE** /notifications/{id} | Delete notification
*NotificationsApi* | [**notificationsIdReadPut**](docs/Api/NotificationsApi.md#notificationsidreadput) | **PUT** /notifications/{id}/read | Mark notification as read
*NotificationsApi* | [**notificationsReadAllPut**](docs/Api/NotificationsApi.md#notificationsreadallput) | **PUT** /notifications/read-all | Mark all notifications as read
*NotificationsApi* | [**notificationsUnreadCountGet**](docs/Api/NotificationsApi.md#notificationsunreadcountget) | **GET** /notifications/unread-count | Get unread notification count
*OAuthApi* | [**oauthGithubCallbackGet**](docs/Api/OAuthApi.md#oauthgithubcallbackget) | **GET** /oauth/github/callback | GitHub OAuth callback
*OAuthApi* | [**oauthGithubGet**](docs/Api/OAuthApi.md#oauthgithubget) | **GET** /oauth/github | GitHub OAuth login redirect
*OAuthApi* | [**oauthGoogleCallbackGet**](docs/Api/OAuthApi.md#oauthgooglecallbackget) | **GET** /oauth/google/callback | Google OAuth callback
*OAuthApi* | [**oauthGoogleGet**](docs/Api/OAuthApi.md#oauthgoogleget) | **GET** /oauth/google | Google OAuth login redirect
*OAuthApi* | [**oauthProvidersGet**](docs/Api/OAuthApi.md#oauthprovidersget) | **GET** /oauth/providers | List available OAuth providers
*OutboundIPsApi* | [**outboundIpsGet**](docs/Api/OutboundIPsApi.md#outboundipsget) | **GET** /outbound-ips | Get outbound IP addresses for firewall whitelisting
*PlaygroundApi* | [**playgroundGet**](docs/Api/PlaygroundApi.md#playgroundget) | **GET** /playground | Get playground info (endpoints, sample payloads)
*PlaygroundApi* | [**playgroundTestPost**](docs/Api/PlaygroundApi.md#playgroundtestpost) | **POST** /playground/test | Test a webhook delivery
*RateLimitsApi* | [**rateLimitsEndpointIdDelete**](docs/Api/RateLimitsApi.md#ratelimitsendpointiddelete) | **DELETE** /rate-limits/{endpoint_id} | Delete rate limit for endpoint
*RateLimitsApi* | [**rateLimitsEndpointIdGet**](docs/Api/RateLimitsApi.md#ratelimitsendpointidget) | **GET** /rate-limits/{endpoint_id} | Get rate limit for endpoint
*RateLimitsApi* | [**rateLimitsEndpointIdPost**](docs/Api/RateLimitsApi.md#ratelimitsendpointidpost) | **POST** /rate-limits/{endpoint_id} | Set rate limit for endpoint
*RateLimitsApi* | [**rateLimitsGet**](docs/Api/RateLimitsApi.md#ratelimitsget) | **GET** /rate-limits | List rate limits
*RoutingApi* | [**endpointsIdHealthGet**](docs/Api/RoutingApi.md#endpointsidhealthget) | **GET** /endpoints/{id}/health | Get endpoint health status
*RoutingApi* | [**endpointsIdRoutingGet**](docs/Api/RoutingApi.md#endpointsidroutingget) | **GET** /endpoints/{id}/routing | Get routing config for endpoint
*RoutingApi* | [**endpointsIdRoutingPut**](docs/Api/RoutingApi.md#endpointsidroutingput) | **PUT** /endpoints/{id}/routing | Update routing config
*SSOApi* | [**ssoConfigDelete**](docs/Api/SSOApi.md#ssoconfigdelete) | **DELETE** /sso/config | Delete SSO configuration
*SSOApi* | [**ssoConfigGet**](docs/Api/SSOApi.md#ssoconfigget) | **GET** /sso/config | Get SSO configuration
*SSOApi* | [**ssoConfigPost**](docs/Api/SSOApi.md#ssoconfigpost) | **POST** /sso/config | Create/update SSO configuration
*SSOApi* | [**ssoTestPost**](docs/Api/SSOApi.md#ssotestpost) | **POST** /sso/test | Test SSO connection
*SchemasApi* | [**schemasGet**](docs/Api/SchemasApi.md#schemasget) | **GET** /schemas | List registered schemas
*SchemasApi* | [**schemasIdGet**](docs/Api/SchemasApi.md#schemasidget) | **GET** /schemas/{id} | Get schema by ID
*SchemasApi* | [**schemasIdValidatePost**](docs/Api/SchemasApi.md#schemasidvalidatepost) | **POST** /schemas/{id}/validate | Validate an event against a schema
*SchemasApi* | [**schemasPost**](docs/Api/SchemasApi.md#schemaspost) | **POST** /schemas | Register a new JSON Schema
*SearchApi* | [**searchGet**](docs/Api/SearchApi.md#searchget) | **GET** /search | Search deliveries
*ServiceTokensApi* | [**serviceTokensGet**](docs/Api/ServiceTokensApi.md#servicetokensget) | **GET** /service-tokens | List service tokens
*ServiceTokensApi* | [**serviceTokensIdDelete**](docs/Api/ServiceTokensApi.md#servicetokensiddelete) | **DELETE** /service-tokens/{id} | Delete service token
*ServiceTokensApi* | [**serviceTokensIdPut**](docs/Api/ServiceTokensApi.md#servicetokensidput) | **PUT** /service-tokens/{id} | Update service token
*ServiceTokensApi* | [**serviceTokensIdRevealPost**](docs/Api/ServiceTokensApi.md#servicetokensidrevealpost) | **POST** /service-tokens/{id}/reveal | Reveal service token
*ServiceTokensApi* | [**serviceTokensPost**](docs/Api/ServiceTokensApi.md#servicetokenspost) | **POST** /service-tokens | Create a service token
*SimulatorApi* | [**simulatorPost**](docs/Api/SimulatorApi.md#simulatorpost) | **POST** /simulator | Simulate a webhook delivery
*StatsApi* | [**statsGet**](docs/Api/StatsApi.md#statsget) | **GET** /stats | Get account statistics
*StreamApi* | [**streamDeliveriesGet**](docs/Api/StreamApi.md#streamdeliveriesget) | **GET** /stream/deliveries | Real-time delivery event stream (SSE)
*TeamsApi* | [**teamsGet**](docs/Api/TeamsApi.md#teamsget) | **GET** /teams | List teams
*TeamsApi* | [**teamsIdGet**](docs/Api/TeamsApi.md#teamsidget) | **GET** /teams/{id} | Get team details
*TeamsApi* | [**teamsIdInvitePost**](docs/Api/TeamsApi.md#teamsidinvitepost) | **POST** /teams/{id}/invite | Invite a member to the team
*TeamsApi* | [**teamsIdMembersGet**](docs/Api/TeamsApi.md#teamsidmembersget) | **GET** /teams/{id}/members | List team members
*TeamsApi* | [**teamsIdMembersUidDelete**](docs/Api/TeamsApi.md#teamsidmembersuiddelete) | **DELETE** /teams/{id}/members/{uid} | Remove member from team
*TeamsApi* | [**teamsIdMembersUidRolePut**](docs/Api/TeamsApi.md#teamsidmembersuidroleput) | **PUT** /teams/{id}/members/{uid}/role | Change member role
*TeamsApi* | [**teamsPost**](docs/Api/TeamsApi.md#teamspost) | **POST** /teams | Create a team
*TemplatesApi* | [**templatesGet**](docs/Api/TemplatesApi.md#templatesget) | **GET** /templates | List available templates
*TemplatesApi* | [**templatesIdApplyPost**](docs/Api/TemplatesApi.md#templatesidapplypost) | **POST** /templates/{id}/apply | Apply template to an endpoint
*TemplatesApi* | [**templatesIdGet**](docs/Api/TemplatesApi.md#templatesidget) | **GET** /templates/{id} | Get template by ID
*TransformsApi* | [**endpointsEndpointIdTransformsGet**](docs/Api/TransformsApi.md#endpointsendpointidtransformsget) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint
*TransformsApi* | [**endpointsEndpointIdTransformsIdDelete**](docs/Api/TransformsApi.md#endpointsendpointidtransformsiddelete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule
*TransformsApi* | [**endpointsEndpointIdTransformsIdPut**](docs/Api/TransformsApi.md#endpointsendpointidtransformsidput) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule
*TransformsApi* | [**endpointsEndpointIdTransformsPost**](docs/Api/TransformsApi.md#endpointsendpointidtransformspost) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule
*TransformsApi* | [**endpointsEndpointIdTransformsTestPost**](docs/Api/TransformsApi.md#endpointsendpointidtransformstestpost) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule
*WebhooksApi* | [**webhooksBatchPost**](docs/Api/WebhooksApi.md#webhooksbatchpost) | **POST** /webhooks/batch | Send multiple webhooks in batch
*WebhooksApi* | [**webhooksBatchReplayPost**](docs/Api/WebhooksApi.md#webhooksbatchreplaypost) | **POST** /webhooks/batch/replay | Replay multiple deliveries by ID
*WebhooksApi* | [**webhooksExportGet**](docs/Api/WebhooksApi.md#webhooksexportget) | **GET** /webhooks/export | Export deliveries as CSV
*WebhooksApi* | [**webhooksGet**](docs/Api/WebhooksApi.md#webhooksget) | **GET** /webhooks | List webhook deliveries
*WebhooksApi* | [**webhooksIdAttemptsGet**](docs/Api/WebhooksApi.md#webhooksidattemptsget) | **GET** /webhooks/{id}/attempts | Get delivery attempts
*WebhooksApi* | [**webhooksIdGet**](docs/Api/WebhooksApi.md#webhooksidget) | **GET** /webhooks/{id} | Get delivery by ID
*WebhooksApi* | [**webhooksIdReplayPost**](docs/Api/WebhooksApi.md#webhooksidreplaypost) | **POST** /webhooks/{id}/replay | Replay a single delivery
*WebhooksApi* | [**webhooksPost**](docs/Api/WebhooksApi.md#webhookspost) | **POST** /webhooks | Send a webhook

## Models

- [AdminAlertRule](docs/Model/AdminAlertRule.md)
- [AdminAlertsIdDelete200Response](docs/Model/AdminAlertsIdDelete200Response.md)
- [AdminAuditEntry](docs/Model/AdminAuditEntry.md)
- [AdminAuditLogResponse](docs/Model/AdminAuditLogResponse.md)
- [AdminCreateAlertRequest](docs/Model/AdminCreateAlertRequest.md)
- [AdminFeatureFlagsGet200Response](docs/Model/AdminFeatureFlagsGet200Response.md)
- [AdminFeatureFlagsIdPutRequest](docs/Model/AdminFeatureFlagsIdPutRequest.md)
- [AdminFeatureFlagsPostRequest](docs/Model/AdminFeatureFlagsPostRequest.md)
- [AdminRevenueEntry](docs/Model/AdminRevenueEntry.md)
- [AdminRevenueResponse](docs/Model/AdminRevenueResponse.md)
- [AdminSdkUpdatePostRequest](docs/Model/AdminSdkUpdatePostRequest.md)
- [AdminSettingsPut200Response](docs/Model/AdminSettingsPut200Response.md)
- [AdminSystemStatus](docs/Model/AdminSystemStatus.md)
- [AdminTestWebhookRequest](docs/Model/AdminTestWebhookRequest.md)
- [AdminTestWebhookResponse](docs/Model/AdminTestWebhookResponse.md)
- [AdminUpdateAlertRequest](docs/Model/AdminUpdateAlertRequest.md)
- [AdminUserListResponse](docs/Model/AdminUserListResponse.md)
- [AdminUsersIdGet200Response](docs/Model/AdminUsersIdGet200Response.md)
- [AdminUsersIdGet200ResponseEndpointsInner](docs/Model/AdminUsersIdGet200ResponseEndpointsInner.md)
- [AdminUsersIdGet200ResponseRecentDeliveriesInner](docs/Model/AdminUsersIdGet200ResponseRecentDeliveriesInner.md)
- [AdminUsersIdGet200ResponseUsageStats](docs/Model/AdminUsersIdGet200ResponseUsageStats.md)
- [AdminUsersIdPlanPutRequest](docs/Model/AdminUsersIdPlanPutRequest.md)
- [AdminUsersIdStatusPutRequest](docs/Model/AdminUsersIdStatusPutRequest.md)
- [AlertNotificationListResponse](docs/Model/AlertNotificationListResponse.md)
- [AlertNotificationListResponseDataInner](docs/Model/AlertNotificationListResponseDataInner.md)
- [AlertRule](docs/Model/AlertRule.md)
- [AlertRuleListResponse](docs/Model/AlertRuleListResponse.md)
- [AnalyticsTrendPoint](docs/Model/AnalyticsTrendPoint.md)
- [AnalyticsTrendResponse](docs/Model/AnalyticsTrendResponse.md)
- [ApiKeyInfo](docs/Model/ApiKeyInfo.md)
- [Application](docs/Model/Application.md)
- [ApplicationsIdPutRequest](docs/Model/ApplicationsIdPutRequest.md)
- [ApplicationsPostRequest](docs/Model/ApplicationsPostRequest.md)
- [ApplyTemplateRequest](docs/Model/ApplyTemplateRequest.md)
- [ApplyTemplateResponse](docs/Model/ApplyTemplateResponse.md)
- [AuditLogEntry](docs/Model/AuditLogEntry.md)
- [AuditLogListResponse](docs/Model/AuditLogListResponse.md)
- [Auth2faEnablePost200Response](docs/Model/Auth2faEnablePost200Response.md)
- [Auth2faStatusGet200Response](docs/Model/Auth2faStatusGet200Response.md)
- [AuthConsentGet200Response](docs/Model/AuthConsentGet200Response.md)
- [AuthConsentPost200Response](docs/Model/AuthConsentPost200Response.md)
- [AuthConsentPostRequest](docs/Model/AuthConsentPostRequest.md)
- [AuthLoginPost200Response](docs/Model/AuthLoginPost200Response.md)
- [AuthResponse](docs/Model/AuthResponse.md)
- [BatchReplayRequest](docs/Model/BatchReplayRequest.md)
- [BatchResponse](docs/Model/BatchResponse.md)
- [BatchResponseErrorsInner](docs/Model/BatchResponseErrorsInner.md)
- [BatchWebhookRequest](docs/Model/BatchWebhookRequest.md)
- [BatchWebhookResponse](docs/Model/BatchWebhookResponse.md)
- [BillingPortalPost200Response](docs/Model/BillingPortalPost200Response.md)
- [BillingPortalResponse](docs/Model/BillingPortalResponse.md)
- [CancelSubscriptionRequest](docs/Model/CancelSubscriptionRequest.md)
- [CancelSubscriptionResponse](docs/Model/CancelSubscriptionResponse.md)
- [ChangePasswordRequest](docs/Model/ChangePasswordRequest.md)
- [ChangeRoleRequest](docs/Model/ChangeRoleRequest.md)
- [ChurnResponse](docs/Model/ChurnResponse.md)
- [ChurnedUser](docs/Model/ChurnedUser.md)
- [Confirm2faRequest](docs/Model/Confirm2faRequest.md)
- [ContactRequest](docs/Model/ContactRequest.md)
- [ContactResponse](docs/Model/ContactResponse.md)
- [CreateAlertRequest](docs/Model/CreateAlertRequest.md)
- [CreateAlertRuleRequest](docs/Model/CreateAlertRuleRequest.md)
- [CreateApiKeyResponse](docs/Model/CreateApiKeyResponse.md)
- [CreateCustomDomainRequest](docs/Model/CreateCustomDomainRequest.md)
- [CreateEndpointRequest](docs/Model/CreateEndpointRequest.md)
- [CreateRoutingRuleRequest](docs/Model/CreateRoutingRuleRequest.md)
- [CreateSSOConfigRequest](docs/Model/CreateSSOConfigRequest.md)
- [CreateTeamRequest](docs/Model/CreateTeamRequest.md)
- [CreateTransformRuleRequest](docs/Model/CreateTransformRuleRequest.md)
- [CreateWebhookRequest](docs/Model/CreateWebhookRequest.md)
- [CustomDomain](docs/Model/CustomDomain.md)
- [CustomDomainListResponse](docs/Model/CustomDomainListResponse.md)
- [CustomDomainsPostRequest](docs/Model/CustomDomainsPostRequest.md)
- [CustomerResponse](docs/Model/CustomerResponse.md)
- [DailyDeliveryCount](docs/Model/DailyDeliveryCount.md)
- [Delivery](docs/Model/Delivery.md)
- [DeliveryAttempt](docs/Model/DeliveryAttempt.md)
- [DeliveryAttemptListResponse](docs/Model/DeliveryAttemptListResponse.md)
- [DeliveryDetailResponse](docs/Model/DeliveryDetailResponse.md)
- [DeliveryListResponse](docs/Model/DeliveryListResponse.md)
- [DeliveryTrendResponse](docs/Model/DeliveryTrendResponse.md)
- [DeliveryTrendResponseBucketsInner](docs/Model/DeliveryTrendResponseBucketsInner.md)
- [DeployInfo](docs/Model/DeployInfo.md)
- [DeviceListResponse](docs/Model/DeviceListResponse.md)
- [DeviceTokenResponse](docs/Model/DeviceTokenResponse.md)
- [Disable2faRequest](docs/Model/Disable2faRequest.md)
- [DomainDnsRecord](docs/Model/DomainDnsRecord.md)
- [EmbedConfig](docs/Model/EmbedConfig.md)
- [EmbedConfigTheme](docs/Model/EmbedConfigTheme.md)
- [Enable2faRequest](docs/Model/Enable2faRequest.md)
- [Enable2faResponse](docs/Model/Enable2faResponse.md)
- [Endpoint](docs/Model/Endpoint.md)
- [EndpointHealth](docs/Model/EndpointHealth.md)
- [EndpointListResponse](docs/Model/EndpointListResponse.md)
- [EndpointsEndpointIdTransformsTestPostRequest](docs/Model/EndpointsEndpointIdTransformsTestPostRequest.md)
- [EndpointsIdRotateSecretPost200Response](docs/Model/EndpointsIdRotateSecretPost200Response.md)
- [Error](docs/Model/Error.md)
- [EventType](docs/Model/EventType.md)
- [EventTypeCount](docs/Model/EventTypeCount.md)
- [EventTypeListResponse](docs/Model/EventTypeListResponse.md)
- [ExportDataResponse](docs/Model/ExportDataResponse.md)
- [FeatureFlag](docs/Model/FeatureFlag.md)
- [ForgotPasswordRequest](docs/Model/ForgotPasswordRequest.md)
- [InboundConfig](docs/Model/InboundConfig.md)
- [InboundConfigsIdPutRequest](docs/Model/InboundConfigsIdPutRequest.md)
- [InboundConfigsPostRequest](docs/Model/InboundConfigsPostRequest.md)
- [InboundWebhookRequest](docs/Model/InboundWebhookRequest.md)
- [InboundWebhookResponse](docs/Model/InboundWebhookResponse.md)
- [InviteMemberRequest](docs/Model/InviteMemberRequest.md)
- [InviteRequest](docs/Model/InviteRequest.md)
- [InvoiceListResponse](docs/Model/InvoiceListResponse.md)
- [InvoiceResponse](docs/Model/InvoiceResponse.md)
- [LatencyResponse](docs/Model/LatencyResponse.md)
- [LatencyTrendResponse](docs/Model/LatencyTrendResponse.md)
- [LatencyTrendResponseBucketsInner](docs/Model/LatencyTrendResponseBucketsInner.md)
- [LoginRequest](docs/Model/LoginRequest.md)
- [LogoutRequest](docs/Model/LogoutRequest.md)
- [Notification](docs/Model/Notification.md)
- [NotificationListResponse](docs/Model/NotificationListResponse.md)
- [NotificationPreferences](docs/Model/NotificationPreferences.md)
- [NotificationsUnreadCountGet200Response](docs/Model/NotificationsUnreadCountGet200Response.md)
- [OAuthCallbackRequest](docs/Model/OAuthCallbackRequest.md)
- [OAuthLoginRedirect](docs/Model/OAuthLoginRedirect.md)
- [OAuthProvider](docs/Model/OAuthProvider.md)
- [OAuthProviderListResponse](docs/Model/OAuthProviderListResponse.md)
- [OutboundIPsResponse](docs/Model/OutboundIPsResponse.md)
- [OutboundIpsResponse](docs/Model/OutboundIpsResponse.md)
- [PaginatedUsers](docs/Model/PaginatedUsers.md)
- [PlatformSettings](docs/Model/PlatformSettings.md)
- [PlaygroundGet200Response](docs/Model/PlaygroundGet200Response.md)
- [PlaygroundTestRequest](docs/Model/PlaygroundTestRequest.md)
- [PlaygroundTestResponse](docs/Model/PlaygroundTestResponse.md)
- [PortalConfig](docs/Model/PortalConfig.md)
- [PortalNotificationsPut200Response](docs/Model/PortalNotificationsPut200Response.md)
- [PortalProfile](docs/Model/PortalProfile.md)
- [PortalSession](docs/Model/PortalSession.md)
- [RateLimitConfig](docs/Model/RateLimitConfig.md)
- [RateLimitUsage](docs/Model/RateLimitUsage.md)
- [RefreshTokenRequest](docs/Model/RefreshTokenRequest.md)
- [RegisterDeviceRequest](docs/Model/RegisterDeviceRequest.md)
- [RegisterRequest](docs/Model/RegisterRequest.md)
- [RegisterSchemaRequest](docs/Model/RegisterSchemaRequest.md)
- [ReplayDeliveryResponse](docs/Model/ReplayDeliveryResponse.md)
- [ResendVerificationRequest](docs/Model/ResendVerificationRequest.md)
- [ResetPasswordRequest](docs/Model/ResetPasswordRequest.md)
- [RetryPolicy](docs/Model/RetryPolicy.md)
- [RevenueResponse](docs/Model/RevenueResponse.md)
- [RevenueResponseMonthlyRevenueInner](docs/Model/RevenueResponseMonthlyRevenueInner.md)
- [RevenueResponseRevenueByPlanInner](docs/Model/RevenueResponseRevenueByPlanInner.md)
- [RotateSecretResponse](docs/Model/RotateSecretResponse.md)
- [RoutingInfo](docs/Model/RoutingInfo.md)
- [RoutingRuleListResponse](docs/Model/RoutingRuleListResponse.md)
- [RoutingRuleListResponseDataInner](docs/Model/RoutingRuleListResponseDataInner.md)
- [SSOConfig](docs/Model/SSOConfig.md)
- [SSOConfigListResponse](docs/Model/SSOConfigListResponse.md)
- [SchemaListResponse](docs/Model/SchemaListResponse.md)
- [SchemaResponse](docs/Model/SchemaResponse.md)
- [SearchRequest](docs/Model/SearchRequest.md)
- [SearchRequestFilters](docs/Model/SearchRequestFilters.md)
- [SearchResponse](docs/Model/SearchResponse.md)
- [SearchResult](docs/Model/SearchResult.md)
- [ServiceToken](docs/Model/ServiceToken.md)
- [ServiceTokenCreateResponse](docs/Model/ServiceTokenCreateResponse.md)
- [ServiceTokensIdPutRequest](docs/Model/ServiceTokensIdPutRequest.md)
- [ServiceTokensIdRevealPost200Response](docs/Model/ServiceTokensIdRevealPost200Response.md)
- [ServiceTokensPostRequest](docs/Model/ServiceTokensPostRequest.md)
- [SimulatorPostRequest](docs/Model/SimulatorPostRequest.md)
- [SimulatorRequest](docs/Model/SimulatorRequest.md)
- [SimulatorResponse](docs/Model/SimulatorResponse.md)
- [SsoConfigPostRequest](docs/Model/SsoConfigPostRequest.md)
- [StatsResponse](docs/Model/StatsResponse.md)
- [StreamParams](docs/Model/StreamParams.md)
- [SubscriptionResponse](docs/Model/SubscriptionResponse.md)
- [SuccessRateResponse](docs/Model/SuccessRateResponse.md)
- [SystemStats](docs/Model/SystemStats.md)
- [SystemStatsPlanBreakdownInner](docs/Model/SystemStatsPlanBreakdownInner.md)
- [SystemStatus](docs/Model/SystemStatus.md)
- [SystemStatusComponentsInner](docs/Model/SystemStatusComponentsInner.md)
- [Team](docs/Model/Team.md)
- [TeamDetailResponse](docs/Model/TeamDetailResponse.md)
- [TeamInvite](docs/Model/TeamInvite.md)
- [TeamListResponse](docs/Model/TeamListResponse.md)
- [TeamMember](docs/Model/TeamMember.md)
- [TeamMemberListResponse](docs/Model/TeamMemberListResponse.md)
- [TemplateListResponse](docs/Model/TemplateListResponse.md)
- [TestWebhookRequest](docs/Model/TestWebhookRequest.md)
- [TestWebhookResponse](docs/Model/TestWebhookResponse.md)
- [TransformRule](docs/Model/TransformRule.md)
- [TransformRuleListResponse](docs/Model/TransformRuleListResponse.md)
- [TwoFactorRequiredResponse](docs/Model/TwoFactorRequiredResponse.md)
- [UpdateAlertRuleRequest](docs/Model/UpdateAlertRuleRequest.md)
- [UpdateEndpointRequest](docs/Model/UpdateEndpointRequest.md)
- [UpdateNotificationPreferences](docs/Model/UpdateNotificationPreferences.md)
- [UpdateProfileRequest](docs/Model/UpdateProfileRequest.md)
- [UpdateRoutingRequest](docs/Model/UpdateRoutingRequest.md)
- [UpdateRoutingRuleRequest](docs/Model/UpdateRoutingRuleRequest.md)
- [UpdateSSOConfigRequest](docs/Model/UpdateSSOConfigRequest.md)
- [UpdateSubscriptionRequest](docs/Model/UpdateSubscriptionRequest.md)
- [UpdateTeamRequest](docs/Model/UpdateTeamRequest.md)
- [UpdateTransformRuleRequest](docs/Model/UpdateTransformRuleRequest.md)
- [UpgradeRequest](docs/Model/UpgradeRequest.md)
- [UpgradeResponse](docs/Model/UpgradeResponse.md)
- [UsageResponse](docs/Model/UsageResponse.md)
- [UsageStatsResponse](docs/Model/UsageStatsResponse.md)
- [UserAnalytics](docs/Model/UserAnalytics.md)
- [UserSummary](docs/Model/UserSummary.md)
- [ValidateEventRequest](docs/Model/ValidateEventRequest.md)
- [ValidateEventResponse](docs/Model/ValidateEventResponse.md)
- [ValidateEventResponseErrorsInner](docs/Model/ValidateEventResponseErrorsInner.md)
- [Verify2faRequest](docs/Model/Verify2faRequest.md)
- [VerifyCustomDomainResponse](docs/Model/VerifyCustomDomainResponse.md)
- [VerifyEmailRequest](docs/Model/VerifyEmailRequest.md)
- [WebhookFilter](docs/Model/WebhookFilter.md)
- [WebhookTemplate](docs/Model/WebhookTemplate.md)

## Authorization

Authentication schemes defined for the API:
### BearerAuth

- **Type**: Bearer authentication

## Tests

To run the tests, use:

```bash
composer install
vendor/bin/phpunit
```

## Author

support@hooksniff.vercel.app

## About this package

This PHP package is automatically generated by the [OpenAPI Generator](https://openapi-generator.tech) project:

- API version: `1.0.0`
    - Generator version: `7.22.0`
- Build package: `org.openapitools.codegen.languages.PhpClientCodegen`
