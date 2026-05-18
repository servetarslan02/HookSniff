# SubscriptionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Plan** | **string** |  | 
**Status** | **string** |  | 
**PaymentProvider** | **string** |  | 
**WebhookLimit** | **int32** |  | 
**EndpointLimit** | **int32** |  | 
**RetentionDays** | **int32** |  | 
**MonthlyPriceCents** | **int64** |  | 

## Methods

### NewSubscriptionResponse

`func NewSubscriptionResponse(plan string, status string, paymentProvider string, webhookLimit int32, endpointLimit int32, retentionDays int32, monthlyPriceCents int64, ) *SubscriptionResponse`

NewSubscriptionResponse instantiates a new SubscriptionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSubscriptionResponseWithDefaults

`func NewSubscriptionResponseWithDefaults() *SubscriptionResponse`

NewSubscriptionResponseWithDefaults instantiates a new SubscriptionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPlan

`func (o *SubscriptionResponse) GetPlan() string`

GetPlan returns the Plan field if non-nil, zero value otherwise.

### GetPlanOk

`func (o *SubscriptionResponse) GetPlanOk() (*string, bool)`

GetPlanOk returns a tuple with the Plan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlan

`func (o *SubscriptionResponse) SetPlan(v string)`

SetPlan sets Plan field to given value.


### GetStatus

`func (o *SubscriptionResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *SubscriptionResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *SubscriptionResponse) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetPaymentProvider

`func (o *SubscriptionResponse) GetPaymentProvider() string`

GetPaymentProvider returns the PaymentProvider field if non-nil, zero value otherwise.

### GetPaymentProviderOk

`func (o *SubscriptionResponse) GetPaymentProviderOk() (*string, bool)`

GetPaymentProviderOk returns a tuple with the PaymentProvider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPaymentProvider

`func (o *SubscriptionResponse) SetPaymentProvider(v string)`

SetPaymentProvider sets PaymentProvider field to given value.


### GetWebhookLimit

`func (o *SubscriptionResponse) GetWebhookLimit() int32`

GetWebhookLimit returns the WebhookLimit field if non-nil, zero value otherwise.

### GetWebhookLimitOk

`func (o *SubscriptionResponse) GetWebhookLimitOk() (*int32, bool)`

GetWebhookLimitOk returns a tuple with the WebhookLimit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookLimit

`func (o *SubscriptionResponse) SetWebhookLimit(v int32)`

SetWebhookLimit sets WebhookLimit field to given value.


### GetEndpointLimit

`func (o *SubscriptionResponse) GetEndpointLimit() int32`

GetEndpointLimit returns the EndpointLimit field if non-nil, zero value otherwise.

### GetEndpointLimitOk

`func (o *SubscriptionResponse) GetEndpointLimitOk() (*int32, bool)`

GetEndpointLimitOk returns a tuple with the EndpointLimit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointLimit

`func (o *SubscriptionResponse) SetEndpointLimit(v int32)`

SetEndpointLimit sets EndpointLimit field to given value.


### GetRetentionDays

`func (o *SubscriptionResponse) GetRetentionDays() int32`

GetRetentionDays returns the RetentionDays field if non-nil, zero value otherwise.

### GetRetentionDaysOk

`func (o *SubscriptionResponse) GetRetentionDaysOk() (*int32, bool)`

GetRetentionDaysOk returns a tuple with the RetentionDays field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRetentionDays

`func (o *SubscriptionResponse) SetRetentionDays(v int32)`

SetRetentionDays sets RetentionDays field to given value.


### GetMonthlyPriceCents

`func (o *SubscriptionResponse) GetMonthlyPriceCents() int64`

GetMonthlyPriceCents returns the MonthlyPriceCents field if non-nil, zero value otherwise.

### GetMonthlyPriceCentsOk

`func (o *SubscriptionResponse) GetMonthlyPriceCentsOk() (*int64, bool)`

GetMonthlyPriceCentsOk returns a tuple with the MonthlyPriceCents field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMonthlyPriceCents

`func (o *SubscriptionResponse) SetMonthlyPriceCents(v int64)`

SetMonthlyPriceCents sets MonthlyPriceCents field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


