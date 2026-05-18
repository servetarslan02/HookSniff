# SuccessRateResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Range** | **string** |  | 
**Successful** | **int32** |  | 
**Failed** | **int32** |  | 
**Pending** | **int32** |  | 
**SuccessRate** | **float64** |  | 

## Methods

### NewSuccessRateResponse

`func NewSuccessRateResponse(range_ string, successful int32, failed int32, pending int32, successRate float64, ) *SuccessRateResponse`

NewSuccessRateResponse instantiates a new SuccessRateResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSuccessRateResponseWithDefaults

`func NewSuccessRateResponseWithDefaults() *SuccessRateResponse`

NewSuccessRateResponseWithDefaults instantiates a new SuccessRateResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRange

`func (o *SuccessRateResponse) GetRange() string`

GetRange returns the Range field if non-nil, zero value otherwise.

### GetRangeOk

`func (o *SuccessRateResponse) GetRangeOk() (*string, bool)`

GetRangeOk returns a tuple with the Range field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRange

`func (o *SuccessRateResponse) SetRange(v string)`

SetRange sets Range field to given value.


### GetSuccessful

`func (o *SuccessRateResponse) GetSuccessful() int32`

GetSuccessful returns the Successful field if non-nil, zero value otherwise.

### GetSuccessfulOk

`func (o *SuccessRateResponse) GetSuccessfulOk() (*int32, bool)`

GetSuccessfulOk returns a tuple with the Successful field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSuccessful

`func (o *SuccessRateResponse) SetSuccessful(v int32)`

SetSuccessful sets Successful field to given value.


### GetFailed

`func (o *SuccessRateResponse) GetFailed() int32`

GetFailed returns the Failed field if non-nil, zero value otherwise.

### GetFailedOk

`func (o *SuccessRateResponse) GetFailedOk() (*int32, bool)`

GetFailedOk returns a tuple with the Failed field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFailed

`func (o *SuccessRateResponse) SetFailed(v int32)`

SetFailed sets Failed field to given value.


### GetPending

`func (o *SuccessRateResponse) GetPending() int32`

GetPending returns the Pending field if non-nil, zero value otherwise.

### GetPendingOk

`func (o *SuccessRateResponse) GetPendingOk() (*int32, bool)`

GetPendingOk returns a tuple with the Pending field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPending

`func (o *SuccessRateResponse) SetPending(v int32)`

SetPending sets Pending field to given value.


### GetSuccessRate

`func (o *SuccessRateResponse) GetSuccessRate() float64`

GetSuccessRate returns the SuccessRate field if non-nil, zero value otherwise.

### GetSuccessRateOk

`func (o *SuccessRateResponse) GetSuccessRateOk() (*float64, bool)`

GetSuccessRateOk returns a tuple with the SuccessRate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSuccessRate

`func (o *SuccessRateResponse) SetSuccessRate(v float64)`

SetSuccessRate sets SuccessRate field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


