# RateLimitConfig

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**RequestsPerSecond** | **int32** | Maximum requests per second allowed | 
**BurstSize** | **int32** | Maximum burst above steady-state rate | 
**Enabled** | **bool** |  | 

## Methods

### NewRateLimitConfig

`func NewRateLimitConfig(requestsPerSecond int32, burstSize int32, enabled bool, ) *RateLimitConfig`

NewRateLimitConfig instantiates a new RateLimitConfig object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRateLimitConfigWithDefaults

`func NewRateLimitConfigWithDefaults() *RateLimitConfig`

NewRateLimitConfigWithDefaults instantiates a new RateLimitConfig object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRequestsPerSecond

`func (o *RateLimitConfig) GetRequestsPerSecond() int32`

GetRequestsPerSecond returns the RequestsPerSecond field if non-nil, zero value otherwise.

### GetRequestsPerSecondOk

`func (o *RateLimitConfig) GetRequestsPerSecondOk() (*int32, bool)`

GetRequestsPerSecondOk returns a tuple with the RequestsPerSecond field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRequestsPerSecond

`func (o *RateLimitConfig) SetRequestsPerSecond(v int32)`

SetRequestsPerSecond sets RequestsPerSecond field to given value.


### GetBurstSize

`func (o *RateLimitConfig) GetBurstSize() int32`

GetBurstSize returns the BurstSize field if non-nil, zero value otherwise.

### GetBurstSizeOk

`func (o *RateLimitConfig) GetBurstSizeOk() (*int32, bool)`

GetBurstSizeOk returns a tuple with the BurstSize field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBurstSize

`func (o *RateLimitConfig) SetBurstSize(v int32)`

SetBurstSize sets BurstSize field to given value.


### GetEnabled

`func (o *RateLimitConfig) GetEnabled() bool`

GetEnabled returns the Enabled field if non-nil, zero value otherwise.

### GetEnabledOk

`func (o *RateLimitConfig) GetEnabledOk() (*bool, bool)`

GetEnabledOk returns a tuple with the Enabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabled

`func (o *RateLimitConfig) SetEnabled(v bool)`

SetEnabled sets Enabled field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


