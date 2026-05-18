# PlatformSettings

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**DefaultPlan** | **string** |  | 
**MaxEndpointsFree** | **int32** |  | 
**MaxEndpointsPro** | **int32** |  | 
**MaxWebhooksFree** | **int32** |  | 
**MaxWebhooksPro** | **int32** |  | 
**RateLimitFree** | **int32** |  | 
**RateLimitPro** | **int32** |  | 
**RetryMaxAttempts** | **int32** |  | 
**RetentionDaysFree** | **int32** |  | 
**RetentionDaysPro** | **int32** |  | 
**MaintenanceMode** | **bool** |  | 
**SignupEnabled** | **bool** |  | 
**PlanPricePro** | **float64** |  | 
**PlanPriceBusiness** | **float64** |  | 
**ResendApiKey** | Pointer to **NullableString** |  | [optional] 
**EmailSender** | Pointer to **NullableString** |  | [optional] 

## Methods

### NewPlatformSettings

`func NewPlatformSettings(defaultPlan string, maxEndpointsFree int32, maxEndpointsPro int32, maxWebhooksFree int32, maxWebhooksPro int32, rateLimitFree int32, rateLimitPro int32, retryMaxAttempts int32, retentionDaysFree int32, retentionDaysPro int32, maintenanceMode bool, signupEnabled bool, planPricePro float64, planPriceBusiness float64, ) *PlatformSettings`

NewPlatformSettings instantiates a new PlatformSettings object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPlatformSettingsWithDefaults

`func NewPlatformSettingsWithDefaults() *PlatformSettings`

NewPlatformSettingsWithDefaults instantiates a new PlatformSettings object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDefaultPlan

`func (o *PlatformSettings) GetDefaultPlan() string`

GetDefaultPlan returns the DefaultPlan field if non-nil, zero value otherwise.

### GetDefaultPlanOk

`func (o *PlatformSettings) GetDefaultPlanOk() (*string, bool)`

GetDefaultPlanOk returns a tuple with the DefaultPlan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefaultPlan

`func (o *PlatformSettings) SetDefaultPlan(v string)`

SetDefaultPlan sets DefaultPlan field to given value.


### GetMaxEndpointsFree

`func (o *PlatformSettings) GetMaxEndpointsFree() int32`

GetMaxEndpointsFree returns the MaxEndpointsFree field if non-nil, zero value otherwise.

### GetMaxEndpointsFreeOk

`func (o *PlatformSettings) GetMaxEndpointsFreeOk() (*int32, bool)`

GetMaxEndpointsFreeOk returns a tuple with the MaxEndpointsFree field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxEndpointsFree

`func (o *PlatformSettings) SetMaxEndpointsFree(v int32)`

SetMaxEndpointsFree sets MaxEndpointsFree field to given value.


### GetMaxEndpointsPro

`func (o *PlatformSettings) GetMaxEndpointsPro() int32`

GetMaxEndpointsPro returns the MaxEndpointsPro field if non-nil, zero value otherwise.

### GetMaxEndpointsProOk

`func (o *PlatformSettings) GetMaxEndpointsProOk() (*int32, bool)`

GetMaxEndpointsProOk returns a tuple with the MaxEndpointsPro field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxEndpointsPro

`func (o *PlatformSettings) SetMaxEndpointsPro(v int32)`

SetMaxEndpointsPro sets MaxEndpointsPro field to given value.


### GetMaxWebhooksFree

`func (o *PlatformSettings) GetMaxWebhooksFree() int32`

GetMaxWebhooksFree returns the MaxWebhooksFree field if non-nil, zero value otherwise.

### GetMaxWebhooksFreeOk

`func (o *PlatformSettings) GetMaxWebhooksFreeOk() (*int32, bool)`

GetMaxWebhooksFreeOk returns a tuple with the MaxWebhooksFree field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxWebhooksFree

`func (o *PlatformSettings) SetMaxWebhooksFree(v int32)`

SetMaxWebhooksFree sets MaxWebhooksFree field to given value.


### GetMaxWebhooksPro

`func (o *PlatformSettings) GetMaxWebhooksPro() int32`

GetMaxWebhooksPro returns the MaxWebhooksPro field if non-nil, zero value otherwise.

### GetMaxWebhooksProOk

`func (o *PlatformSettings) GetMaxWebhooksProOk() (*int32, bool)`

GetMaxWebhooksProOk returns a tuple with the MaxWebhooksPro field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxWebhooksPro

`func (o *PlatformSettings) SetMaxWebhooksPro(v int32)`

SetMaxWebhooksPro sets MaxWebhooksPro field to given value.


### GetRateLimitFree

`func (o *PlatformSettings) GetRateLimitFree() int32`

GetRateLimitFree returns the RateLimitFree field if non-nil, zero value otherwise.

### GetRateLimitFreeOk

`func (o *PlatformSettings) GetRateLimitFreeOk() (*int32, bool)`

GetRateLimitFreeOk returns a tuple with the RateLimitFree field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRateLimitFree

`func (o *PlatformSettings) SetRateLimitFree(v int32)`

SetRateLimitFree sets RateLimitFree field to given value.


### GetRateLimitPro

`func (o *PlatformSettings) GetRateLimitPro() int32`

GetRateLimitPro returns the RateLimitPro field if non-nil, zero value otherwise.

### GetRateLimitProOk

`func (o *PlatformSettings) GetRateLimitProOk() (*int32, bool)`

GetRateLimitProOk returns a tuple with the RateLimitPro field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRateLimitPro

`func (o *PlatformSettings) SetRateLimitPro(v int32)`

SetRateLimitPro sets RateLimitPro field to given value.


### GetRetryMaxAttempts

`func (o *PlatformSettings) GetRetryMaxAttempts() int32`

GetRetryMaxAttempts returns the RetryMaxAttempts field if non-nil, zero value otherwise.

### GetRetryMaxAttemptsOk

`func (o *PlatformSettings) GetRetryMaxAttemptsOk() (*int32, bool)`

GetRetryMaxAttemptsOk returns a tuple with the RetryMaxAttempts field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRetryMaxAttempts

`func (o *PlatformSettings) SetRetryMaxAttempts(v int32)`

SetRetryMaxAttempts sets RetryMaxAttempts field to given value.


### GetRetentionDaysFree

`func (o *PlatformSettings) GetRetentionDaysFree() int32`

GetRetentionDaysFree returns the RetentionDaysFree field if non-nil, zero value otherwise.

### GetRetentionDaysFreeOk

`func (o *PlatformSettings) GetRetentionDaysFreeOk() (*int32, bool)`

GetRetentionDaysFreeOk returns a tuple with the RetentionDaysFree field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRetentionDaysFree

`func (o *PlatformSettings) SetRetentionDaysFree(v int32)`

SetRetentionDaysFree sets RetentionDaysFree field to given value.


### GetRetentionDaysPro

`func (o *PlatformSettings) GetRetentionDaysPro() int32`

GetRetentionDaysPro returns the RetentionDaysPro field if non-nil, zero value otherwise.

### GetRetentionDaysProOk

`func (o *PlatformSettings) GetRetentionDaysProOk() (*int32, bool)`

GetRetentionDaysProOk returns a tuple with the RetentionDaysPro field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRetentionDaysPro

`func (o *PlatformSettings) SetRetentionDaysPro(v int32)`

SetRetentionDaysPro sets RetentionDaysPro field to given value.


### GetMaintenanceMode

`func (o *PlatformSettings) GetMaintenanceMode() bool`

GetMaintenanceMode returns the MaintenanceMode field if non-nil, zero value otherwise.

### GetMaintenanceModeOk

`func (o *PlatformSettings) GetMaintenanceModeOk() (*bool, bool)`

GetMaintenanceModeOk returns a tuple with the MaintenanceMode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaintenanceMode

`func (o *PlatformSettings) SetMaintenanceMode(v bool)`

SetMaintenanceMode sets MaintenanceMode field to given value.


### GetSignupEnabled

`func (o *PlatformSettings) GetSignupEnabled() bool`

GetSignupEnabled returns the SignupEnabled field if non-nil, zero value otherwise.

### GetSignupEnabledOk

`func (o *PlatformSettings) GetSignupEnabledOk() (*bool, bool)`

GetSignupEnabledOk returns a tuple with the SignupEnabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSignupEnabled

`func (o *PlatformSettings) SetSignupEnabled(v bool)`

SetSignupEnabled sets SignupEnabled field to given value.


### GetPlanPricePro

`func (o *PlatformSettings) GetPlanPricePro() float64`

GetPlanPricePro returns the PlanPricePro field if non-nil, zero value otherwise.

### GetPlanPriceProOk

`func (o *PlatformSettings) GetPlanPriceProOk() (*float64, bool)`

GetPlanPriceProOk returns a tuple with the PlanPricePro field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlanPricePro

`func (o *PlatformSettings) SetPlanPricePro(v float64)`

SetPlanPricePro sets PlanPricePro field to given value.


### GetPlanPriceBusiness

`func (o *PlatformSettings) GetPlanPriceBusiness() float64`

GetPlanPriceBusiness returns the PlanPriceBusiness field if non-nil, zero value otherwise.

### GetPlanPriceBusinessOk

`func (o *PlatformSettings) GetPlanPriceBusinessOk() (*float64, bool)`

GetPlanPriceBusinessOk returns a tuple with the PlanPriceBusiness field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlanPriceBusiness

`func (o *PlatformSettings) SetPlanPriceBusiness(v float64)`

SetPlanPriceBusiness sets PlanPriceBusiness field to given value.


### GetResendApiKey

`func (o *PlatformSettings) GetResendApiKey() string`

GetResendApiKey returns the ResendApiKey field if non-nil, zero value otherwise.

### GetResendApiKeyOk

`func (o *PlatformSettings) GetResendApiKeyOk() (*string, bool)`

GetResendApiKeyOk returns a tuple with the ResendApiKey field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResendApiKey

`func (o *PlatformSettings) SetResendApiKey(v string)`

SetResendApiKey sets ResendApiKey field to given value.

### HasResendApiKey

`func (o *PlatformSettings) HasResendApiKey() bool`

HasResendApiKey returns a boolean if a field has been set.

### SetResendApiKeyNil

`func (o *PlatformSettings) SetResendApiKeyNil(b bool)`

 SetResendApiKeyNil sets the value for ResendApiKey to be an explicit nil

### UnsetResendApiKey
`func (o *PlatformSettings) UnsetResendApiKey()`

UnsetResendApiKey ensures that no value is present for ResendApiKey, not even an explicit nil
### GetEmailSender

`func (o *PlatformSettings) GetEmailSender() string`

GetEmailSender returns the EmailSender field if non-nil, zero value otherwise.

### GetEmailSenderOk

`func (o *PlatformSettings) GetEmailSenderOk() (*string, bool)`

GetEmailSenderOk returns a tuple with the EmailSender field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmailSender

`func (o *PlatformSettings) SetEmailSender(v string)`

SetEmailSender sets EmailSender field to given value.

### HasEmailSender

`func (o *PlatformSettings) HasEmailSender() bool`

HasEmailSender returns a boolean if a field has been set.

### SetEmailSenderNil

`func (o *PlatformSettings) SetEmailSenderNil(b bool)`

 SetEmailSenderNil sets the value for EmailSender to be an explicit nil

### UnsetEmailSender
`func (o *PlatformSettings) UnsetEmailSender()`

UnsetEmailSender ensures that no value is present for EmailSender, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


