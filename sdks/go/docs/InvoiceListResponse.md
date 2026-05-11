# InvoiceListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | [**[]InvoiceResponse**](InvoiceResponse.md) |  | 
**HasMore** | **bool** |  | 
**Total** | **int32** |  | 

## Methods

### NewInvoiceListResponse

`func NewInvoiceListResponse(data []InvoiceResponse, hasMore bool, total int32, ) *InvoiceListResponse`

NewInvoiceListResponse instantiates a new InvoiceListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInvoiceListResponseWithDefaults

`func NewInvoiceListResponseWithDefaults() *InvoiceListResponse`

NewInvoiceListResponseWithDefaults instantiates a new InvoiceListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *InvoiceListResponse) GetData() []InvoiceResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *InvoiceListResponse) GetDataOk() (*[]InvoiceResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *InvoiceListResponse) SetData(v []InvoiceResponse)`

SetData sets Data field to given value.


### GetHasMore

`func (o *InvoiceListResponse) GetHasMore() bool`

GetHasMore returns the HasMore field if non-nil, zero value otherwise.

### GetHasMoreOk

`func (o *InvoiceListResponse) GetHasMoreOk() (*bool, bool)`

GetHasMoreOk returns a tuple with the HasMore field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasMore

`func (o *InvoiceListResponse) SetHasMore(v bool)`

SetHasMore sets HasMore field to given value.


### GetTotal

`func (o *InvoiceListResponse) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *InvoiceListResponse) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *InvoiceListResponse) SetTotal(v int32)`

SetTotal sets Total field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


