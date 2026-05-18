# RateLimitUsage

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CurrentRps** | **float64** | Current requests per second being consumed | 
**LimitRps** | **float64** | Configured requests per second limit | 
**Remaining** | **float64** | Remaining capacity | 
**ResetAt** | **time.Time** |  | 

## Methods

### NewRateLimitUsage

`func NewRateLimitUsage(currentRps float64, limitRps float64, remaining float64, resetAt time.Time, ) *RateLimitUsage`

NewRateLimitUsage instantiates a new RateLimitUsage object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRateLimitUsageWithDefaults

`func NewRateLimitUsageWithDefaults() *RateLimitUsage`

NewRateLimitUsageWithDefaults instantiates a new RateLimitUsage object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCurrentRps

`func (o *RateLimitUsage) GetCurrentRps() float64`

GetCurrentRps returns the CurrentRps field if non-nil, zero value otherwise.

### GetCurrentRpsOk

`func (o *RateLimitUsage) GetCurrentRpsOk() (*float64, bool)`

GetCurrentRpsOk returns a tuple with the CurrentRps field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrentRps

`func (o *RateLimitUsage) SetCurrentRps(v float64)`

SetCurrentRps sets CurrentRps field to given value.


### GetLimitRps

`func (o *RateLimitUsage) GetLimitRps() float64`

GetLimitRps returns the LimitRps field if non-nil, zero value otherwise.

### GetLimitRpsOk

`func (o *RateLimitUsage) GetLimitRpsOk() (*float64, bool)`

GetLimitRpsOk returns a tuple with the LimitRps field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLimitRps

`func (o *RateLimitUsage) SetLimitRps(v float64)`

SetLimitRps sets LimitRps field to given value.


### GetRemaining

`func (o *RateLimitUsage) GetRemaining() float64`

GetRemaining returns the Remaining field if non-nil, zero value otherwise.

### GetRemainingOk

`func (o *RateLimitUsage) GetRemainingOk() (*float64, bool)`

GetRemainingOk returns a tuple with the Remaining field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRemaining

`func (o *RateLimitUsage) SetRemaining(v float64)`

SetRemaining sets Remaining field to given value.


### GetResetAt

`func (o *RateLimitUsage) GetResetAt() time.Time`

GetResetAt returns the ResetAt field if non-nil, zero value otherwise.

### GetResetAtOk

`func (o *RateLimitUsage) GetResetAtOk() (*time.Time, bool)`

GetResetAtOk returns a tuple with the ResetAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResetAt

`func (o *RateLimitUsage) SetResetAt(v time.Time)`

SetResetAt sets ResetAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


