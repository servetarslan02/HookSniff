# DeliveryListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Deliveries** | [**[]Delivery**](Delivery.md) |  | 
**Total** | **int32** |  | 
**Page** | **int32** |  | 
**PerPage** | **int32** |  | 

## Methods

### NewDeliveryListResponse

`func NewDeliveryListResponse(deliveries []Delivery, total int32, page int32, perPage int32, ) *DeliveryListResponse`

NewDeliveryListResponse instantiates a new DeliveryListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeliveryListResponseWithDefaults

`func NewDeliveryListResponseWithDefaults() *DeliveryListResponse`

NewDeliveryListResponseWithDefaults instantiates a new DeliveryListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDeliveries

`func (o *DeliveryListResponse) GetDeliveries() []Delivery`

GetDeliveries returns the Deliveries field if non-nil, zero value otherwise.

### GetDeliveriesOk

`func (o *DeliveryListResponse) GetDeliveriesOk() (*[]Delivery, bool)`

GetDeliveriesOk returns a tuple with the Deliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDeliveries

`func (o *DeliveryListResponse) SetDeliveries(v []Delivery)`

SetDeliveries sets Deliveries field to given value.


### GetTotal

`func (o *DeliveryListResponse) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *DeliveryListResponse) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *DeliveryListResponse) SetTotal(v int32)`

SetTotal sets Total field to given value.


### GetPage

`func (o *DeliveryListResponse) GetPage() int32`

GetPage returns the Page field if non-nil, zero value otherwise.

### GetPageOk

`func (o *DeliveryListResponse) GetPageOk() (*int32, bool)`

GetPageOk returns a tuple with the Page field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPage

`func (o *DeliveryListResponse) SetPage(v int32)`

SetPage sets Page field to given value.


### GetPerPage

`func (o *DeliveryListResponse) GetPerPage() int32`

GetPerPage returns the PerPage field if non-nil, zero value otherwise.

### GetPerPageOk

`func (o *DeliveryListResponse) GetPerPageOk() (*int32, bool)`

GetPerPageOk returns a tuple with the PerPage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPerPage

`func (o *DeliveryListResponse) SetPerPage(v int32)`

SetPerPage sets PerPage field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


