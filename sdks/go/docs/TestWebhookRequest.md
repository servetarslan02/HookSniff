# TestWebhookRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **string** |  | 
**Payload** | **map[string]interface{}** |  | 
**Event** | Pointer to **string** |  | [optional] 

## Methods

### NewTestWebhookRequest

`func NewTestWebhookRequest(endpointId string, payload map[string]interface{}, ) *TestWebhookRequest`

NewTestWebhookRequest instantiates a new TestWebhookRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTestWebhookRequestWithDefaults

`func NewTestWebhookRequestWithDefaults() *TestWebhookRequest`

NewTestWebhookRequestWithDefaults instantiates a new TestWebhookRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *TestWebhookRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *TestWebhookRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *TestWebhookRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetPayload

`func (o *TestWebhookRequest) GetPayload() map[string]interface{}`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *TestWebhookRequest) GetPayloadOk() (*map[string]interface{}, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *TestWebhookRequest) SetPayload(v map[string]interface{})`

SetPayload sets Payload field to given value.


### GetEvent

`func (o *TestWebhookRequest) GetEvent() string`

GetEvent returns the Event field if non-nil, zero value otherwise.

### GetEventOk

`func (o *TestWebhookRequest) GetEventOk() (*string, bool)`

GetEventOk returns a tuple with the Event field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvent

`func (o *TestWebhookRequest) SetEvent(v string)`

SetEvent sets Event field to given value.

### HasEvent

`func (o *TestWebhookRequest) HasEvent() bool`

HasEvent returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


