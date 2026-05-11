# UsageResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Plan** | **string** |  | 
**PeriodStart** | **time.Time** |  | 
**PeriodEnd** | **time.Time** |  | 
**WebhooksUsed** | **int32** |  | 
**WebhooksLimit** | **int32** |  | 
**EndpointsUsed** | **int32** |  | 
**EndpointsLimit** | **int32** |  | 

## Methods

### NewUsageResponse

`func NewUsageResponse(plan string, periodStart time.Time, periodEnd time.Time, webhooksUsed int32, webhooksLimit int32, endpointsUsed int32, endpointsLimit int32, ) *UsageResponse`

NewUsageResponse instantiates a new UsageResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUsageResponseWithDefaults

`func NewUsageResponseWithDefaults() *UsageResponse`

NewUsageResponseWithDefaults instantiates a new UsageResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPlan

`func (o *UsageResponse) GetPlan() string`

GetPlan returns the Plan field if non-nil, zero value otherwise.

### GetPlanOk

`func (o *UsageResponse) GetPlanOk() (*string, bool)`

GetPlanOk returns a tuple with the Plan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlan

`func (o *UsageResponse) SetPlan(v string)`

SetPlan sets Plan field to given value.


### GetPeriodStart

`func (o *UsageResponse) GetPeriodStart() time.Time`

GetPeriodStart returns the PeriodStart field if non-nil, zero value otherwise.

### GetPeriodStartOk

`func (o *UsageResponse) GetPeriodStartOk() (*time.Time, bool)`

GetPeriodStartOk returns a tuple with the PeriodStart field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPeriodStart

`func (o *UsageResponse) SetPeriodStart(v time.Time)`

SetPeriodStart sets PeriodStart field to given value.


### GetPeriodEnd

`func (o *UsageResponse) GetPeriodEnd() time.Time`

GetPeriodEnd returns the PeriodEnd field if non-nil, zero value otherwise.

### GetPeriodEndOk

`func (o *UsageResponse) GetPeriodEndOk() (*time.Time, bool)`

GetPeriodEndOk returns a tuple with the PeriodEnd field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPeriodEnd

`func (o *UsageResponse) SetPeriodEnd(v time.Time)`

SetPeriodEnd sets PeriodEnd field to given value.


### GetWebhooksUsed

`func (o *UsageResponse) GetWebhooksUsed() int32`

GetWebhooksUsed returns the WebhooksUsed field if non-nil, zero value otherwise.

### GetWebhooksUsedOk

`func (o *UsageResponse) GetWebhooksUsedOk() (*int32, bool)`

GetWebhooksUsedOk returns a tuple with the WebhooksUsed field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooksUsed

`func (o *UsageResponse) SetWebhooksUsed(v int32)`

SetWebhooksUsed sets WebhooksUsed field to given value.


### GetWebhooksLimit

`func (o *UsageResponse) GetWebhooksLimit() int32`

GetWebhooksLimit returns the WebhooksLimit field if non-nil, zero value otherwise.

### GetWebhooksLimitOk

`func (o *UsageResponse) GetWebhooksLimitOk() (*int32, bool)`

GetWebhooksLimitOk returns a tuple with the WebhooksLimit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooksLimit

`func (o *UsageResponse) SetWebhooksLimit(v int32)`

SetWebhooksLimit sets WebhooksLimit field to given value.


### GetEndpointsUsed

`func (o *UsageResponse) GetEndpointsUsed() int32`

GetEndpointsUsed returns the EndpointsUsed field if non-nil, zero value otherwise.

### GetEndpointsUsedOk

`func (o *UsageResponse) GetEndpointsUsedOk() (*int32, bool)`

GetEndpointsUsedOk returns a tuple with the EndpointsUsed field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointsUsed

`func (o *UsageResponse) SetEndpointsUsed(v int32)`

SetEndpointsUsed sets EndpointsUsed field to given value.


### GetEndpointsLimit

`func (o *UsageResponse) GetEndpointsLimit() int32`

GetEndpointsLimit returns the EndpointsLimit field if non-nil, zero value otherwise.

### GetEndpointsLimitOk

`func (o *UsageResponse) GetEndpointsLimitOk() (*int32, bool)`

GetEndpointsLimitOk returns a tuple with the EndpointsLimit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointsLimit

`func (o *UsageResponse) SetEndpointsLimit(v int32)`

SetEndpointsLimit sets EndpointsLimit field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


