# RetryPolicy

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**MaxAttempts** | **int32** |  | [default to 3]
**Backoff** | **string** |  | [default to "exponential"]
**InitialDelaySecs** | **int32** |  | [default to 10]
**MaxDelaySecs** | **int32** |  | [default to 3600]

## Methods

### NewRetryPolicy

`func NewRetryPolicy(maxAttempts int32, backoff string, initialDelaySecs int32, maxDelaySecs int32, ) *RetryPolicy`

NewRetryPolicy instantiates a new RetryPolicy object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRetryPolicyWithDefaults

`func NewRetryPolicyWithDefaults() *RetryPolicy`

NewRetryPolicyWithDefaults instantiates a new RetryPolicy object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMaxAttempts

`func (o *RetryPolicy) GetMaxAttempts() int32`

GetMaxAttempts returns the MaxAttempts field if non-nil, zero value otherwise.

### GetMaxAttemptsOk

`func (o *RetryPolicy) GetMaxAttemptsOk() (*int32, bool)`

GetMaxAttemptsOk returns a tuple with the MaxAttempts field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxAttempts

`func (o *RetryPolicy) SetMaxAttempts(v int32)`

SetMaxAttempts sets MaxAttempts field to given value.


### GetBackoff

`func (o *RetryPolicy) GetBackoff() string`

GetBackoff returns the Backoff field if non-nil, zero value otherwise.

### GetBackoffOk

`func (o *RetryPolicy) GetBackoffOk() (*string, bool)`

GetBackoffOk returns a tuple with the Backoff field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBackoff

`func (o *RetryPolicy) SetBackoff(v string)`

SetBackoff sets Backoff field to given value.


### GetInitialDelaySecs

`func (o *RetryPolicy) GetInitialDelaySecs() int32`

GetInitialDelaySecs returns the InitialDelaySecs field if non-nil, zero value otherwise.

### GetInitialDelaySecsOk

`func (o *RetryPolicy) GetInitialDelaySecsOk() (*int32, bool)`

GetInitialDelaySecsOk returns a tuple with the InitialDelaySecs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInitialDelaySecs

`func (o *RetryPolicy) SetInitialDelaySecs(v int32)`

SetInitialDelaySecs sets InitialDelaySecs field to given value.


### GetMaxDelaySecs

`func (o *RetryPolicy) GetMaxDelaySecs() int32`

GetMaxDelaySecs returns the MaxDelaySecs field if non-nil, zero value otherwise.

### GetMaxDelaySecsOk

`func (o *RetryPolicy) GetMaxDelaySecsOk() (*int32, bool)`

GetMaxDelaySecsOk returns a tuple with the MaxDelaySecs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMaxDelaySecs

`func (o *RetryPolicy) SetMaxDelaySecs(v int32)`

SetMaxDelaySecs sets MaxDelaySecs field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


