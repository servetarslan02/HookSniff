# EndpointHealth

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **string** |  | 
**IsHealthy** | **bool** |  | 
**FailureStreak** | Pointer to **int32** |  | [optional] 
**AvgResponseMs** | Pointer to **int32** |  | [optional] 
**LastFailureAt** | Pointer to **time.Time** |  | [optional] 
**SuccessRate** | Pointer to **float64** | Success rate as a fraction (0.0–1.0) | [optional] 
**AvgLatencyMs** | Pointer to **float32** | Average delivery latency in milliseconds | [optional] 
**LastDeliveryAt** | Pointer to **time.Time** |  | [optional] 
**TotalDeliveries** | Pointer to **int32** |  | [optional] 
**FailedDeliveries** | Pointer to **int32** |  | [optional] 

## Methods

### NewEndpointHealth

`func NewEndpointHealth(endpointId string, isHealthy bool, ) *EndpointHealth`

NewEndpointHealth instantiates a new EndpointHealth object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEndpointHealthWithDefaults

`func NewEndpointHealthWithDefaults() *EndpointHealth`

NewEndpointHealthWithDefaults instantiates a new EndpointHealth object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *EndpointHealth) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *EndpointHealth) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *EndpointHealth) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetIsHealthy

`func (o *EndpointHealth) GetIsHealthy() bool`

GetIsHealthy returns the IsHealthy field if non-nil, zero value otherwise.

### GetIsHealthyOk

`func (o *EndpointHealth) GetIsHealthyOk() (*bool, bool)`

GetIsHealthyOk returns a tuple with the IsHealthy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsHealthy

`func (o *EndpointHealth) SetIsHealthy(v bool)`

SetIsHealthy sets IsHealthy field to given value.


### GetFailureStreak

`func (o *EndpointHealth) GetFailureStreak() int32`

GetFailureStreak returns the FailureStreak field if non-nil, zero value otherwise.

### GetFailureStreakOk

`func (o *EndpointHealth) GetFailureStreakOk() (*int32, bool)`

GetFailureStreakOk returns a tuple with the FailureStreak field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFailureStreak

`func (o *EndpointHealth) SetFailureStreak(v int32)`

SetFailureStreak sets FailureStreak field to given value.

### HasFailureStreak

`func (o *EndpointHealth) HasFailureStreak() bool`

HasFailureStreak returns a boolean if a field has been set.

### GetAvgResponseMs

`func (o *EndpointHealth) GetAvgResponseMs() int32`

GetAvgResponseMs returns the AvgResponseMs field if non-nil, zero value otherwise.

### GetAvgResponseMsOk

`func (o *EndpointHealth) GetAvgResponseMsOk() (*int32, bool)`

GetAvgResponseMsOk returns a tuple with the AvgResponseMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAvgResponseMs

`func (o *EndpointHealth) SetAvgResponseMs(v int32)`

SetAvgResponseMs sets AvgResponseMs field to given value.

### HasAvgResponseMs

`func (o *EndpointHealth) HasAvgResponseMs() bool`

HasAvgResponseMs returns a boolean if a field has been set.

### GetLastFailureAt

`func (o *EndpointHealth) GetLastFailureAt() time.Time`

GetLastFailureAt returns the LastFailureAt field if non-nil, zero value otherwise.

### GetLastFailureAtOk

`func (o *EndpointHealth) GetLastFailureAtOk() (*time.Time, bool)`

GetLastFailureAtOk returns a tuple with the LastFailureAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLastFailureAt

`func (o *EndpointHealth) SetLastFailureAt(v time.Time)`

SetLastFailureAt sets LastFailureAt field to given value.

### HasLastFailureAt

`func (o *EndpointHealth) HasLastFailureAt() bool`

HasLastFailureAt returns a boolean if a field has been set.

### GetSuccessRate

`func (o *EndpointHealth) GetSuccessRate() float64`

GetSuccessRate returns the SuccessRate field if non-nil, zero value otherwise.

### GetSuccessRateOk

`func (o *EndpointHealth) GetSuccessRateOk() (*float64, bool)`

GetSuccessRateOk returns a tuple with the SuccessRate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSuccessRate

`func (o *EndpointHealth) SetSuccessRate(v float64)`

SetSuccessRate sets SuccessRate field to given value.

### HasSuccessRate

`func (o *EndpointHealth) HasSuccessRate() bool`

HasSuccessRate returns a boolean if a field has been set.

### GetAvgLatencyMs

`func (o *EndpointHealth) GetAvgLatencyMs() float32`

GetAvgLatencyMs returns the AvgLatencyMs field if non-nil, zero value otherwise.

### GetAvgLatencyMsOk

`func (o *EndpointHealth) GetAvgLatencyMsOk() (*float32, bool)`

GetAvgLatencyMsOk returns a tuple with the AvgLatencyMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAvgLatencyMs

`func (o *EndpointHealth) SetAvgLatencyMs(v float32)`

SetAvgLatencyMs sets AvgLatencyMs field to given value.

### HasAvgLatencyMs

`func (o *EndpointHealth) HasAvgLatencyMs() bool`

HasAvgLatencyMs returns a boolean if a field has been set.

### GetLastDeliveryAt

`func (o *EndpointHealth) GetLastDeliveryAt() time.Time`

GetLastDeliveryAt returns the LastDeliveryAt field if non-nil, zero value otherwise.

### GetLastDeliveryAtOk

`func (o *EndpointHealth) GetLastDeliveryAtOk() (*time.Time, bool)`

GetLastDeliveryAtOk returns a tuple with the LastDeliveryAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLastDeliveryAt

`func (o *EndpointHealth) SetLastDeliveryAt(v time.Time)`

SetLastDeliveryAt sets LastDeliveryAt field to given value.

### HasLastDeliveryAt

`func (o *EndpointHealth) HasLastDeliveryAt() bool`

HasLastDeliveryAt returns a boolean if a field has been set.

### GetTotalDeliveries

`func (o *EndpointHealth) GetTotalDeliveries() int32`

GetTotalDeliveries returns the TotalDeliveries field if non-nil, zero value otherwise.

### GetTotalDeliveriesOk

`func (o *EndpointHealth) GetTotalDeliveriesOk() (*int32, bool)`

GetTotalDeliveriesOk returns a tuple with the TotalDeliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalDeliveries

`func (o *EndpointHealth) SetTotalDeliveries(v int32)`

SetTotalDeliveries sets TotalDeliveries field to given value.

### HasTotalDeliveries

`func (o *EndpointHealth) HasTotalDeliveries() bool`

HasTotalDeliveries returns a boolean if a field has been set.

### GetFailedDeliveries

`func (o *EndpointHealth) GetFailedDeliveries() int32`

GetFailedDeliveries returns the FailedDeliveries field if non-nil, zero value otherwise.

### GetFailedDeliveriesOk

`func (o *EndpointHealth) GetFailedDeliveriesOk() (*int32, bool)`

GetFailedDeliveriesOk returns a tuple with the FailedDeliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFailedDeliveries

`func (o *EndpointHealth) SetFailedDeliveries(v int32)`

SetFailedDeliveries sets FailedDeliveries field to given value.

### HasFailedDeliveries

`func (o *EndpointHealth) HasFailedDeliveries() bool`

HasFailedDeliveries returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


