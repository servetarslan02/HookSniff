# LatencyTrendResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Range** | Pointer to **string** |  | [optional] 
**Buckets** | Pointer to [**[]LatencyTrendResponseBucketsInner**](LatencyTrendResponseBucketsInner.md) |  | [optional] 
**OverallAvgMs** | Pointer to **float32** |  | [optional] 

## Methods

### NewLatencyTrendResponse

`func NewLatencyTrendResponse() *LatencyTrendResponse`

NewLatencyTrendResponse instantiates a new LatencyTrendResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewLatencyTrendResponseWithDefaults

`func NewLatencyTrendResponseWithDefaults() *LatencyTrendResponse`

NewLatencyTrendResponseWithDefaults instantiates a new LatencyTrendResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRange

`func (o *LatencyTrendResponse) GetRange() string`

GetRange returns the Range field if non-nil, zero value otherwise.

### GetRangeOk

`func (o *LatencyTrendResponse) GetRangeOk() (*string, bool)`

GetRangeOk returns a tuple with the Range field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRange

`func (o *LatencyTrendResponse) SetRange(v string)`

SetRange sets Range field to given value.

### HasRange

`func (o *LatencyTrendResponse) HasRange() bool`

HasRange returns a boolean if a field has been set.

### GetBuckets

`func (o *LatencyTrendResponse) GetBuckets() []LatencyTrendResponseBucketsInner`

GetBuckets returns the Buckets field if non-nil, zero value otherwise.

### GetBucketsOk

`func (o *LatencyTrendResponse) GetBucketsOk() (*[]LatencyTrendResponseBucketsInner, bool)`

GetBucketsOk returns a tuple with the Buckets field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBuckets

`func (o *LatencyTrendResponse) SetBuckets(v []LatencyTrendResponseBucketsInner)`

SetBuckets sets Buckets field to given value.

### HasBuckets

`func (o *LatencyTrendResponse) HasBuckets() bool`

HasBuckets returns a boolean if a field has been set.

### GetOverallAvgMs

`func (o *LatencyTrendResponse) GetOverallAvgMs() float32`

GetOverallAvgMs returns the OverallAvgMs field if non-nil, zero value otherwise.

### GetOverallAvgMsOk

`func (o *LatencyTrendResponse) GetOverallAvgMsOk() (*float32, bool)`

GetOverallAvgMsOk returns a tuple with the OverallAvgMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOverallAvgMs

`func (o *LatencyTrendResponse) SetOverallAvgMs(v float32)`

SetOverallAvgMs sets OverallAvgMs field to given value.

### HasOverallAvgMs

`func (o *LatencyTrendResponse) HasOverallAvgMs() bool`

HasOverallAvgMs returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


