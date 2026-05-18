# PlaygroundTestRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **string** |  | 
**Payload** | **map[string]interface{}** | The payload to send | 
**Headers** | Pointer to **map[string]interface{}** | Custom headers to include with the request | [optional] 

## Methods

### NewPlaygroundTestRequest

`func NewPlaygroundTestRequest(endpointId string, payload map[string]interface{}, ) *PlaygroundTestRequest`

NewPlaygroundTestRequest instantiates a new PlaygroundTestRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPlaygroundTestRequestWithDefaults

`func NewPlaygroundTestRequestWithDefaults() *PlaygroundTestRequest`

NewPlaygroundTestRequestWithDefaults instantiates a new PlaygroundTestRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *PlaygroundTestRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *PlaygroundTestRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *PlaygroundTestRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetPayload

`func (o *PlaygroundTestRequest) GetPayload() map[string]interface{}`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *PlaygroundTestRequest) GetPayloadOk() (*map[string]interface{}, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *PlaygroundTestRequest) SetPayload(v map[string]interface{})`

SetPayload sets Payload field to given value.


### GetHeaders

`func (o *PlaygroundTestRequest) GetHeaders() map[string]interface{}`

GetHeaders returns the Headers field if non-nil, zero value otherwise.

### GetHeadersOk

`func (o *PlaygroundTestRequest) GetHeadersOk() (*map[string]interface{}, bool)`

GetHeadersOk returns a tuple with the Headers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHeaders

`func (o *PlaygroundTestRequest) SetHeaders(v map[string]interface{})`

SetHeaders sets Headers field to given value.

### HasHeaders

`func (o *PlaygroundTestRequest) HasHeaders() bool`

HasHeaders returns a boolean if a field has been set.

### SetHeadersNil

`func (o *PlaygroundTestRequest) SetHeadersNil(b bool)`

 SetHeadersNil sets the value for Headers to be an explicit nil

### UnsetHeaders
`func (o *PlaygroundTestRequest) UnsetHeaders()`

UnsetHeaders ensures that no value is present for Headers, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


