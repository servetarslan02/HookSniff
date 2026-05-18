# SimulatorRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **string** |  | 
**EventType** | **string** | Event type to simulate (e.g. order.created) | 
**Payload** | **map[string]interface{}** | The webhook payload to deliver | 
**DelayMs** | Pointer to **NullableInt32** | Artificial delay before delivery (for testing timeouts) | [optional] 

## Methods

### NewSimulatorRequest

`func NewSimulatorRequest(endpointId string, eventType string, payload map[string]interface{}, ) *SimulatorRequest`

NewSimulatorRequest instantiates a new SimulatorRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSimulatorRequestWithDefaults

`func NewSimulatorRequestWithDefaults() *SimulatorRequest`

NewSimulatorRequestWithDefaults instantiates a new SimulatorRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *SimulatorRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *SimulatorRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *SimulatorRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetEventType

`func (o *SimulatorRequest) GetEventType() string`

GetEventType returns the EventType field if non-nil, zero value otherwise.

### GetEventTypeOk

`func (o *SimulatorRequest) GetEventTypeOk() (*string, bool)`

GetEventTypeOk returns a tuple with the EventType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventType

`func (o *SimulatorRequest) SetEventType(v string)`

SetEventType sets EventType field to given value.


### GetPayload

`func (o *SimulatorRequest) GetPayload() map[string]interface{}`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *SimulatorRequest) GetPayloadOk() (*map[string]interface{}, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *SimulatorRequest) SetPayload(v map[string]interface{})`

SetPayload sets Payload field to given value.


### GetDelayMs

`func (o *SimulatorRequest) GetDelayMs() int32`

GetDelayMs returns the DelayMs field if non-nil, zero value otherwise.

### GetDelayMsOk

`func (o *SimulatorRequest) GetDelayMsOk() (*int32, bool)`

GetDelayMsOk returns a tuple with the DelayMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDelayMs

`func (o *SimulatorRequest) SetDelayMs(v int32)`

SetDelayMs sets DelayMs field to given value.

### HasDelayMs

`func (o *SimulatorRequest) HasDelayMs() bool`

HasDelayMs returns a boolean if a field has been set.

### SetDelayMsNil

`func (o *SimulatorRequest) SetDelayMsNil(b bool)`

 SetDelayMsNil sets the value for DelayMs to be an explicit nil

### UnsetDelayMs
`func (o *SimulatorRequest) UnsetDelayMs()`

UnsetDelayMs ensures that no value is present for DelayMs, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


