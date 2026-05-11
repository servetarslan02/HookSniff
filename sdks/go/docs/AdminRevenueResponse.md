# AdminRevenueResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | [**[]AdminRevenueEntry**](AdminRevenueEntry.md) |  | 
**TotalMrr** | **float64** | Current total MRR across all subscriptions | 

## Methods

### NewAdminRevenueResponse

`func NewAdminRevenueResponse(data []AdminRevenueEntry, totalMrr float64, ) *AdminRevenueResponse`

NewAdminRevenueResponse instantiates a new AdminRevenueResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminRevenueResponseWithDefaults

`func NewAdminRevenueResponseWithDefaults() *AdminRevenueResponse`

NewAdminRevenueResponseWithDefaults instantiates a new AdminRevenueResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *AdminRevenueResponse) GetData() []AdminRevenueEntry`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *AdminRevenueResponse) GetDataOk() (*[]AdminRevenueEntry, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *AdminRevenueResponse) SetData(v []AdminRevenueEntry)`

SetData sets Data field to given value.


### GetTotalMrr

`func (o *AdminRevenueResponse) GetTotalMrr() float64`

GetTotalMrr returns the TotalMrr field if non-nil, zero value otherwise.

### GetTotalMrrOk

`func (o *AdminRevenueResponse) GetTotalMrrOk() (*float64, bool)`

GetTotalMrrOk returns a tuple with the TotalMrr field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalMrr

`func (o *AdminRevenueResponse) SetTotalMrr(v float64)`

SetTotalMrr sets TotalMrr field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


