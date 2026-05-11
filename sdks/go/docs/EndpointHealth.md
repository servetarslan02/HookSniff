# EndpointHealth

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | Pointer to **string** |  | [optional] 
**IsHealthy** | Pointer to **bool** |  | [optional] 
**FailureStreak** | Pointer to **int32** |  | [optional] 
**AvgResponseMs** | Pointer to **int32** |  | [optional] 
**LastFailureAt** | Pointer to **time.Time** |  | [optional] 

## Methods

### NewEndpointHealth

`func NewEndpointHealth() *EndpointHealth`

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

### HasEndpointId

`func (o *EndpointHealth) HasEndpointId() bool`

HasEndpointId returns a boolean if a field has been set.

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

### HasIsHealthy

`func (o *EndpointHealth) HasIsHealthy() bool`

HasIsHealthy returns a boolean if a field has been set.

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


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


