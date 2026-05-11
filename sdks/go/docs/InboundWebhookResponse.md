# InboundWebhookResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Status** | **string** | Processing status of the inbound webhook | 
**EndpointId** | **string** |  | 
**ReceivedAt** | **time.Time** |  | 

## Methods

### NewInboundWebhookResponse

`func NewInboundWebhookResponse(id string, status string, endpointId string, receivedAt time.Time, ) *InboundWebhookResponse`

NewInboundWebhookResponse instantiates a new InboundWebhookResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInboundWebhookResponseWithDefaults

`func NewInboundWebhookResponseWithDefaults() *InboundWebhookResponse`

NewInboundWebhookResponseWithDefaults instantiates a new InboundWebhookResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *InboundWebhookResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *InboundWebhookResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *InboundWebhookResponse) SetId(v string)`

SetId sets Id field to given value.


### GetStatus

`func (o *InboundWebhookResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *InboundWebhookResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *InboundWebhookResponse) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetEndpointId

`func (o *InboundWebhookResponse) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *InboundWebhookResponse) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *InboundWebhookResponse) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetReceivedAt

`func (o *InboundWebhookResponse) GetReceivedAt() time.Time`

GetReceivedAt returns the ReceivedAt field if non-nil, zero value otherwise.

### GetReceivedAtOk

`func (o *InboundWebhookResponse) GetReceivedAtOk() (*time.Time, bool)`

GetReceivedAtOk returns a tuple with the ReceivedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetReceivedAt

`func (o *InboundWebhookResponse) SetReceivedAt(v time.Time)`

SetReceivedAt sets ReceivedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


