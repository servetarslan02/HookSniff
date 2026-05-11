# AnalyticsTrendPoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Date** | **string** | Date of the data point | 
**Total** | **int32** | Total deliveries on this date | 
**Successful** | **int32** | Successfully delivered on this date | 
**Failed** | **int32** | Failed deliveries on this date | 
**AvgLatencyMs** | Pointer to **float32** | Average delivery latency in milliseconds | [optional] 

## Methods

### NewAnalyticsTrendPoint

`func NewAnalyticsTrendPoint(date string, total int32, successful int32, failed int32, ) *AnalyticsTrendPoint`

NewAnalyticsTrendPoint instantiates a new AnalyticsTrendPoint object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAnalyticsTrendPointWithDefaults

`func NewAnalyticsTrendPointWithDefaults() *AnalyticsTrendPoint`

NewAnalyticsTrendPointWithDefaults instantiates a new AnalyticsTrendPoint object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDate

`func (o *AnalyticsTrendPoint) GetDate() string`

GetDate returns the Date field if non-nil, zero value otherwise.

### GetDateOk

`func (o *AnalyticsTrendPoint) GetDateOk() (*string, bool)`

GetDateOk returns a tuple with the Date field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDate

`func (o *AnalyticsTrendPoint) SetDate(v string)`

SetDate sets Date field to given value.


### GetTotal

`func (o *AnalyticsTrendPoint) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *AnalyticsTrendPoint) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *AnalyticsTrendPoint) SetTotal(v int32)`

SetTotal sets Total field to given value.


### GetSuccessful

`func (o *AnalyticsTrendPoint) GetSuccessful() int32`

GetSuccessful returns the Successful field if non-nil, zero value otherwise.

### GetSuccessfulOk

`func (o *AnalyticsTrendPoint) GetSuccessfulOk() (*int32, bool)`

GetSuccessfulOk returns a tuple with the Successful field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSuccessful

`func (o *AnalyticsTrendPoint) SetSuccessful(v int32)`

SetSuccessful sets Successful field to given value.


### GetFailed

`func (o *AnalyticsTrendPoint) GetFailed() int32`

GetFailed returns the Failed field if non-nil, zero value otherwise.

### GetFailedOk

`func (o *AnalyticsTrendPoint) GetFailedOk() (*int32, bool)`

GetFailedOk returns a tuple with the Failed field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFailed

`func (o *AnalyticsTrendPoint) SetFailed(v int32)`

SetFailed sets Failed field to given value.


### GetAvgLatencyMs

`func (o *AnalyticsTrendPoint) GetAvgLatencyMs() float32`

GetAvgLatencyMs returns the AvgLatencyMs field if non-nil, zero value otherwise.

### GetAvgLatencyMsOk

`func (o *AnalyticsTrendPoint) GetAvgLatencyMsOk() (*float32, bool)`

GetAvgLatencyMsOk returns a tuple with the AvgLatencyMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAvgLatencyMs

`func (o *AnalyticsTrendPoint) SetAvgLatencyMs(v float32)`

SetAvgLatencyMs sets AvgLatencyMs field to given value.

### HasAvgLatencyMs

`func (o *AnalyticsTrendPoint) HasAvgLatencyMs() bool`

HasAvgLatencyMs returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


