# CreateWebhookRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **string** |  | 
**Event** | Pointer to **string** | Event type (e.g. \&quot;order.created\&quot;) | [optional] 
**Data** | **map[string]interface{}** | Webhook payload | 

## Methods

### NewCreateWebhookRequest

`func NewCreateWebhookRequest(endpointId string, data map[string]interface{}, ) *CreateWebhookRequest`

NewCreateWebhookRequest instantiates a new CreateWebhookRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateWebhookRequestWithDefaults

`func NewCreateWebhookRequestWithDefaults() *CreateWebhookRequest`

NewCreateWebhookRequestWithDefaults instantiates a new CreateWebhookRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *CreateWebhookRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *CreateWebhookRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *CreateWebhookRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetEvent

`func (o *CreateWebhookRequest) GetEvent() string`

GetEvent returns the Event field if non-nil, zero value otherwise.

### GetEventOk

`func (o *CreateWebhookRequest) GetEventOk() (*string, bool)`

GetEventOk returns a tuple with the Event field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvent

`func (o *CreateWebhookRequest) SetEvent(v string)`

SetEvent sets Event field to given value.

### HasEvent

`func (o *CreateWebhookRequest) HasEvent() bool`

HasEvent returns a boolean if a field has been set.

### GetData

`func (o *CreateWebhookRequest) GetData() map[string]interface{}`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *CreateWebhookRequest) GetDataOk() (*map[string]interface{}, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *CreateWebhookRequest) SetData(v map[string]interface{})`

SetData sets Data field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


