# AdminTestWebhookRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointUrl** | **string** |  | 
**EventType** | Pointer to **NullableString** |  | [optional] 
**Payload** | **map[string]interface{}** |  | 

## Methods

### NewAdminTestWebhookRequest

`func NewAdminTestWebhookRequest(endpointUrl string, payload map[string]interface{}, ) *AdminTestWebhookRequest`

NewAdminTestWebhookRequest instantiates a new AdminTestWebhookRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminTestWebhookRequestWithDefaults

`func NewAdminTestWebhookRequestWithDefaults() *AdminTestWebhookRequest`

NewAdminTestWebhookRequestWithDefaults instantiates a new AdminTestWebhookRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointUrl

`func (o *AdminTestWebhookRequest) GetEndpointUrl() string`

GetEndpointUrl returns the EndpointUrl field if non-nil, zero value otherwise.

### GetEndpointUrlOk

`func (o *AdminTestWebhookRequest) GetEndpointUrlOk() (*string, bool)`

GetEndpointUrlOk returns a tuple with the EndpointUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointUrl

`func (o *AdminTestWebhookRequest) SetEndpointUrl(v string)`

SetEndpointUrl sets EndpointUrl field to given value.


### GetEventType

`func (o *AdminTestWebhookRequest) GetEventType() string`

GetEventType returns the EventType field if non-nil, zero value otherwise.

### GetEventTypeOk

`func (o *AdminTestWebhookRequest) GetEventTypeOk() (*string, bool)`

GetEventTypeOk returns a tuple with the EventType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventType

`func (o *AdminTestWebhookRequest) SetEventType(v string)`

SetEventType sets EventType field to given value.

### HasEventType

`func (o *AdminTestWebhookRequest) HasEventType() bool`

HasEventType returns a boolean if a field has been set.

### SetEventTypeNil

`func (o *AdminTestWebhookRequest) SetEventTypeNil(b bool)`

 SetEventTypeNil sets the value for EventType to be an explicit nil

### UnsetEventType
`func (o *AdminTestWebhookRequest) UnsetEventType()`

UnsetEventType ensures that no value is present for EventType, not even an explicit nil
### GetPayload

`func (o *AdminTestWebhookRequest) GetPayload() map[string]interface{}`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *AdminTestWebhookRequest) GetPayloadOk() (*map[string]interface{}, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *AdminTestWebhookRequest) SetPayload(v map[string]interface{})`

SetPayload sets Payload field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


