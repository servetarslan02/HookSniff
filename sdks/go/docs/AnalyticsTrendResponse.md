# AnalyticsTrendResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | [**[]AnalyticsTrendPoint**](AnalyticsTrendPoint.md) | Array of trend data points | 
**Period** | **string** | Time range of the data | 

## Methods

### NewAnalyticsTrendResponse

`func NewAnalyticsTrendResponse(data []AnalyticsTrendPoint, period string, ) *AnalyticsTrendResponse`

NewAnalyticsTrendResponse instantiates a new AnalyticsTrendResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAnalyticsTrendResponseWithDefaults

`func NewAnalyticsTrendResponseWithDefaults() *AnalyticsTrendResponse`

NewAnalyticsTrendResponseWithDefaults instantiates a new AnalyticsTrendResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *AnalyticsTrendResponse) GetData() []AnalyticsTrendPoint`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *AnalyticsTrendResponse) GetDataOk() (*[]AnalyticsTrendPoint, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *AnalyticsTrendResponse) SetData(v []AnalyticsTrendPoint)`

SetData sets Data field to given value.


### GetPeriod

`func (o *AnalyticsTrendResponse) GetPeriod() string`

GetPeriod returns the Period field if non-nil, zero value otherwise.

### GetPeriodOk

`func (o *AnalyticsTrendResponse) GetPeriodOk() (*string, bool)`

GetPeriodOk returns a tuple with the Period field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPeriod

`func (o *AnalyticsTrendResponse) SetPeriod(v string)`

SetPeriod sets Period field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


