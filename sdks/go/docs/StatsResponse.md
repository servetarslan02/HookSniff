# StatsResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**TotalDeliveries** | **int32** |  | 
**SuccessfulDeliveries** | **int32** |  | 
**FailedDeliveries** | **int32** |  | 
**TotalEndpoints** | **int32** |  | 
**ActiveEndpoints** | **int32** |  | 
**Plan** | **string** |  | 
**WebhookLimit** | **int32** |  | 
**WebhookCount** | **int32** |  | 

## Methods

### NewStatsResponse

`func NewStatsResponse(totalDeliveries int32, successfulDeliveries int32, failedDeliveries int32, totalEndpoints int32, activeEndpoints int32, plan string, webhookLimit int32, webhookCount int32, ) *StatsResponse`

NewStatsResponse instantiates a new StatsResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStatsResponseWithDefaults

`func NewStatsResponseWithDefaults() *StatsResponse`

NewStatsResponseWithDefaults instantiates a new StatsResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTotalDeliveries

`func (o *StatsResponse) GetTotalDeliveries() int32`

GetTotalDeliveries returns the TotalDeliveries field if non-nil, zero value otherwise.

### GetTotalDeliveriesOk

`func (o *StatsResponse) GetTotalDeliveriesOk() (*int32, bool)`

GetTotalDeliveriesOk returns a tuple with the TotalDeliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalDeliveries

`func (o *StatsResponse) SetTotalDeliveries(v int32)`

SetTotalDeliveries sets TotalDeliveries field to given value.


### GetSuccessfulDeliveries

`func (o *StatsResponse) GetSuccessfulDeliveries() int32`

GetSuccessfulDeliveries returns the SuccessfulDeliveries field if non-nil, zero value otherwise.

### GetSuccessfulDeliveriesOk

`func (o *StatsResponse) GetSuccessfulDeliveriesOk() (*int32, bool)`

GetSuccessfulDeliveriesOk returns a tuple with the SuccessfulDeliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSuccessfulDeliveries

`func (o *StatsResponse) SetSuccessfulDeliveries(v int32)`

SetSuccessfulDeliveries sets SuccessfulDeliveries field to given value.


### GetFailedDeliveries

`func (o *StatsResponse) GetFailedDeliveries() int32`

GetFailedDeliveries returns the FailedDeliveries field if non-nil, zero value otherwise.

### GetFailedDeliveriesOk

`func (o *StatsResponse) GetFailedDeliveriesOk() (*int32, bool)`

GetFailedDeliveriesOk returns a tuple with the FailedDeliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFailedDeliveries

`func (o *StatsResponse) SetFailedDeliveries(v int32)`

SetFailedDeliveries sets FailedDeliveries field to given value.


### GetTotalEndpoints

`func (o *StatsResponse) GetTotalEndpoints() int32`

GetTotalEndpoints returns the TotalEndpoints field if non-nil, zero value otherwise.

### GetTotalEndpointsOk

`func (o *StatsResponse) GetTotalEndpointsOk() (*int32, bool)`

GetTotalEndpointsOk returns a tuple with the TotalEndpoints field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalEndpoints

`func (o *StatsResponse) SetTotalEndpoints(v int32)`

SetTotalEndpoints sets TotalEndpoints field to given value.


### GetActiveEndpoints

`func (o *StatsResponse) GetActiveEndpoints() int32`

GetActiveEndpoints returns the ActiveEndpoints field if non-nil, zero value otherwise.

### GetActiveEndpointsOk

`func (o *StatsResponse) GetActiveEndpointsOk() (*int32, bool)`

GetActiveEndpointsOk returns a tuple with the ActiveEndpoints field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetActiveEndpoints

`func (o *StatsResponse) SetActiveEndpoints(v int32)`

SetActiveEndpoints sets ActiveEndpoints field to given value.


### GetPlan

`func (o *StatsResponse) GetPlan() string`

GetPlan returns the Plan field if non-nil, zero value otherwise.

### GetPlanOk

`func (o *StatsResponse) GetPlanOk() (*string, bool)`

GetPlanOk returns a tuple with the Plan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlan

`func (o *StatsResponse) SetPlan(v string)`

SetPlan sets Plan field to given value.


### GetWebhookLimit

`func (o *StatsResponse) GetWebhookLimit() int32`

GetWebhookLimit returns the WebhookLimit field if non-nil, zero value otherwise.

### GetWebhookLimitOk

`func (o *StatsResponse) GetWebhookLimitOk() (*int32, bool)`

GetWebhookLimitOk returns a tuple with the WebhookLimit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookLimit

`func (o *StatsResponse) SetWebhookLimit(v int32)`

SetWebhookLimit sets WebhookLimit field to given value.


### GetWebhookCount

`func (o *StatsResponse) GetWebhookCount() int32`

GetWebhookCount returns the WebhookCount field if non-nil, zero value otherwise.

### GetWebhookCountOk

`func (o *StatsResponse) GetWebhookCountOk() (*int32, bool)`

GetWebhookCountOk returns a tuple with the WebhookCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookCount

`func (o *StatsResponse) SetWebhookCount(v int32)`

SetWebhookCount sets WebhookCount field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


