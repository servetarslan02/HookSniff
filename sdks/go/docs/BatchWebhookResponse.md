# BatchWebhookResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**DeliveryIds** | **[]string** | List of created delivery IDs | 
**Count** | **int32** | Number of deliveries created | 

## Methods

### NewBatchWebhookResponse

`func NewBatchWebhookResponse(deliveryIds []string, count int32, ) *BatchWebhookResponse`

NewBatchWebhookResponse instantiates a new BatchWebhookResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewBatchWebhookResponseWithDefaults

`func NewBatchWebhookResponseWithDefaults() *BatchWebhookResponse`

NewBatchWebhookResponseWithDefaults instantiates a new BatchWebhookResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDeliveryIds

`func (o *BatchWebhookResponse) GetDeliveryIds() []string`

GetDeliveryIds returns the DeliveryIds field if non-nil, zero value otherwise.

### GetDeliveryIdsOk

`func (o *BatchWebhookResponse) GetDeliveryIdsOk() (*[]string, bool)`

GetDeliveryIdsOk returns a tuple with the DeliveryIds field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDeliveryIds

`func (o *BatchWebhookResponse) SetDeliveryIds(v []string)`

SetDeliveryIds sets DeliveryIds field to given value.


### GetCount

`func (o *BatchWebhookResponse) GetCount() int32`

GetCount returns the Count field if non-nil, zero value otherwise.

### GetCountOk

`func (o *BatchWebhookResponse) GetCountOk() (*int32, bool)`

GetCountOk returns a tuple with the Count field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCount

`func (o *BatchWebhookResponse) SetCount(v int32)`

SetCount sets Count field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


