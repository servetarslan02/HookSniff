# LatencyResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**P50** | **float32** | 50th percentile (median) latency in ms | 
**P90** | **float32** | 90th percentile latency in ms | 
**P95** | **float32** | 95th percentile latency in ms | 
**P99** | **float32** | 99th percentile latency in ms | 
**Period** | **string** | Time range of the data | 

## Methods

### NewLatencyResponse

`func NewLatencyResponse(p50 float32, p90 float32, p95 float32, p99 float32, period string, ) *LatencyResponse`

NewLatencyResponse instantiates a new LatencyResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewLatencyResponseWithDefaults

`func NewLatencyResponseWithDefaults() *LatencyResponse`

NewLatencyResponseWithDefaults instantiates a new LatencyResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetP50

`func (o *LatencyResponse) GetP50() float32`

GetP50 returns the P50 field if non-nil, zero value otherwise.

### GetP50Ok

`func (o *LatencyResponse) GetP50Ok() (*float32, bool)`

GetP50Ok returns a tuple with the P50 field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetP50

`func (o *LatencyResponse) SetP50(v float32)`

SetP50 sets P50 field to given value.


### GetP90

`func (o *LatencyResponse) GetP90() float32`

GetP90 returns the P90 field if non-nil, zero value otherwise.

### GetP90Ok

`func (o *LatencyResponse) GetP90Ok() (*float32, bool)`

GetP90Ok returns a tuple with the P90 field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetP90

`func (o *LatencyResponse) SetP90(v float32)`

SetP90 sets P90 field to given value.


### GetP95

`func (o *LatencyResponse) GetP95() float32`

GetP95 returns the P95 field if non-nil, zero value otherwise.

### GetP95Ok

`func (o *LatencyResponse) GetP95Ok() (*float32, bool)`

GetP95Ok returns a tuple with the P95 field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetP95

`func (o *LatencyResponse) SetP95(v float32)`

SetP95 sets P95 field to given value.


### GetP99

`func (o *LatencyResponse) GetP99() float32`

GetP99 returns the P99 field if non-nil, zero value otherwise.

### GetP99Ok

`func (o *LatencyResponse) GetP99Ok() (*float32, bool)`

GetP99Ok returns a tuple with the P99 field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetP99

`func (o *LatencyResponse) SetP99(v float32)`

SetP99 sets P99 field to given value.


### GetPeriod

`func (o *LatencyResponse) GetPeriod() string`

GetPeriod returns the Period field if non-nil, zero value otherwise.

### GetPeriodOk

`func (o *LatencyResponse) GetPeriodOk() (*string, bool)`

GetPeriodOk returns a tuple with the Period field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPeriod

`func (o *LatencyResponse) SetPeriod(v string)`

SetPeriod sets Period field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


