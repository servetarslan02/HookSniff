# BatchResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Deliveries** | Pointer to [**[]Delivery**](Delivery.md) |  | [optional] 
**Errors** | Pointer to [**[]BatchResponseErrorsInner**](BatchResponseErrorsInner.md) |  | [optional] 

## Methods

### NewBatchResponse

`func NewBatchResponse() *BatchResponse`

NewBatchResponse instantiates a new BatchResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewBatchResponseWithDefaults

`func NewBatchResponseWithDefaults() *BatchResponse`

NewBatchResponseWithDefaults instantiates a new BatchResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDeliveries

`func (o *BatchResponse) GetDeliveries() []Delivery`

GetDeliveries returns the Deliveries field if non-nil, zero value otherwise.

### GetDeliveriesOk

`func (o *BatchResponse) GetDeliveriesOk() (*[]Delivery, bool)`

GetDeliveriesOk returns a tuple with the Deliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDeliveries

`func (o *BatchResponse) SetDeliveries(v []Delivery)`

SetDeliveries sets Deliveries field to given value.

### HasDeliveries

`func (o *BatchResponse) HasDeliveries() bool`

HasDeliveries returns a boolean if a field has been set.

### GetErrors

`func (o *BatchResponse) GetErrors() []BatchResponseErrorsInner`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *BatchResponse) GetErrorsOk() (*[]BatchResponseErrorsInner, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *BatchResponse) SetErrors(v []BatchResponseErrorsInner)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *BatchResponse) HasErrors() bool`

HasErrors returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


