# RoutingInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **string** |  | 
**RoutingStrategy** | **string** |  | 
**FallbackUrl** | Pointer to **NullableString** |  | [optional] 
**AvgResponseMs** | **int32** |  | 
**FailureStreak** | **int32** |  | 
**IsHealthy** | **bool** |  | 

## Methods

### NewRoutingInfo

`func NewRoutingInfo(endpointId string, routingStrategy string, avgResponseMs int32, failureStreak int32, isHealthy bool, ) *RoutingInfo`

NewRoutingInfo instantiates a new RoutingInfo object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRoutingInfoWithDefaults

`func NewRoutingInfoWithDefaults() *RoutingInfo`

NewRoutingInfoWithDefaults instantiates a new RoutingInfo object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *RoutingInfo) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *RoutingInfo) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *RoutingInfo) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetRoutingStrategy

`func (o *RoutingInfo) GetRoutingStrategy() string`

GetRoutingStrategy returns the RoutingStrategy field if non-nil, zero value otherwise.

### GetRoutingStrategyOk

`func (o *RoutingInfo) GetRoutingStrategyOk() (*string, bool)`

GetRoutingStrategyOk returns a tuple with the RoutingStrategy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoutingStrategy

`func (o *RoutingInfo) SetRoutingStrategy(v string)`

SetRoutingStrategy sets RoutingStrategy field to given value.


### GetFallbackUrl

`func (o *RoutingInfo) GetFallbackUrl() string`

GetFallbackUrl returns the FallbackUrl field if non-nil, zero value otherwise.

### GetFallbackUrlOk

`func (o *RoutingInfo) GetFallbackUrlOk() (*string, bool)`

GetFallbackUrlOk returns a tuple with the FallbackUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFallbackUrl

`func (o *RoutingInfo) SetFallbackUrl(v string)`

SetFallbackUrl sets FallbackUrl field to given value.

### HasFallbackUrl

`func (o *RoutingInfo) HasFallbackUrl() bool`

HasFallbackUrl returns a boolean if a field has been set.

### SetFallbackUrlNil

`func (o *RoutingInfo) SetFallbackUrlNil(b bool)`

 SetFallbackUrlNil sets the value for FallbackUrl to be an explicit nil

### UnsetFallbackUrl
`func (o *RoutingInfo) UnsetFallbackUrl()`

UnsetFallbackUrl ensures that no value is present for FallbackUrl, not even an explicit nil
### GetAvgResponseMs

`func (o *RoutingInfo) GetAvgResponseMs() int32`

GetAvgResponseMs returns the AvgResponseMs field if non-nil, zero value otherwise.

### GetAvgResponseMsOk

`func (o *RoutingInfo) GetAvgResponseMsOk() (*int32, bool)`

GetAvgResponseMsOk returns a tuple with the AvgResponseMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAvgResponseMs

`func (o *RoutingInfo) SetAvgResponseMs(v int32)`

SetAvgResponseMs sets AvgResponseMs field to given value.


### GetFailureStreak

`func (o *RoutingInfo) GetFailureStreak() int32`

GetFailureStreak returns the FailureStreak field if non-nil, zero value otherwise.

### GetFailureStreakOk

`func (o *RoutingInfo) GetFailureStreakOk() (*int32, bool)`

GetFailureStreakOk returns a tuple with the FailureStreak field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFailureStreak

`func (o *RoutingInfo) SetFailureStreak(v int32)`

SetFailureStreak sets FailureStreak field to given value.


### GetIsHealthy

`func (o *RoutingInfo) GetIsHealthy() bool`

GetIsHealthy returns the IsHealthy field if non-nil, zero value otherwise.

### GetIsHealthyOk

`func (o *RoutingInfo) GetIsHealthyOk() (*bool, bool)`

GetIsHealthyOk returns a tuple with the IsHealthy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsHealthy

`func (o *RoutingInfo) SetIsHealthy(v bool)`

SetIsHealthy sets IsHealthy field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


