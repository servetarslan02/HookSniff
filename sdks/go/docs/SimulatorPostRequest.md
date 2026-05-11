# SimulatorPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | Pointer to **string** |  | [optional] 
**Event** | Pointer to **string** |  | [optional] 
**Data** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewSimulatorPostRequest

`func NewSimulatorPostRequest() *SimulatorPostRequest`

NewSimulatorPostRequest instantiates a new SimulatorPostRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSimulatorPostRequestWithDefaults

`func NewSimulatorPostRequestWithDefaults() *SimulatorPostRequest`

NewSimulatorPostRequestWithDefaults instantiates a new SimulatorPostRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *SimulatorPostRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *SimulatorPostRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *SimulatorPostRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.

### HasEndpointId

`func (o *SimulatorPostRequest) HasEndpointId() bool`

HasEndpointId returns a boolean if a field has been set.

### GetEvent

`func (o *SimulatorPostRequest) GetEvent() string`

GetEvent returns the Event field if non-nil, zero value otherwise.

### GetEventOk

`func (o *SimulatorPostRequest) GetEventOk() (*string, bool)`

GetEventOk returns a tuple with the Event field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvent

`func (o *SimulatorPostRequest) SetEvent(v string)`

SetEvent sets Event field to given value.

### HasEvent

`func (o *SimulatorPostRequest) HasEvent() bool`

HasEvent returns a boolean if a field has been set.

### GetData

`func (o *SimulatorPostRequest) GetData() map[string]interface{}`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *SimulatorPostRequest) GetDataOk() (*map[string]interface{}, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *SimulatorPostRequest) SetData(v map[string]interface{})`

SetData sets Data field to given value.

### HasData

`func (o *SimulatorPostRequest) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


