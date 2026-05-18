# LatencyTrendResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Range** | **string** |  | 
**Buckets** | [**[]LatencyTrendResponseBucketsInner**](LatencyTrendResponseBucketsInner.md) |  | 
**OverallAvgMs** | **float32** |  | 

## Methods

### NewLatencyTrendResponse

`func NewLatencyTrendResponse(range_ string, buckets []LatencyTrendResponseBucketsInner, overallAvgMs float32, ) *LatencyTrendResponse`

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



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


