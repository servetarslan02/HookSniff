# InboundConfigsIdPutRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Secret** | Pointer to **string** |  | [optional] 
**EndpointId** | Pointer to **NullableString** |  | [optional] 
**Enabled** | Pointer to **bool** |  | [optional] 

## Methods

### NewInboundConfigsIdPutRequest

`func NewInboundConfigsIdPutRequest() *InboundConfigsIdPutRequest`

NewInboundConfigsIdPutRequest instantiates a new InboundConfigsIdPutRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInboundConfigsIdPutRequestWithDefaults

`func NewInboundConfigsIdPutRequestWithDefaults() *InboundConfigsIdPutRequest`

NewInboundConfigsIdPutRequestWithDefaults instantiates a new InboundConfigsIdPutRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSecret

`func (o *InboundConfigsIdPutRequest) GetSecret() string`

GetSecret returns the Secret field if non-nil, zero value otherwise.

### GetSecretOk

`func (o *InboundConfigsIdPutRequest) GetSecretOk() (*string, bool)`

GetSecretOk returns a tuple with the Secret field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSecret

`func (o *InboundConfigsIdPutRequest) SetSecret(v string)`

SetSecret sets Secret field to given value.

### HasSecret

`func (o *InboundConfigsIdPutRequest) HasSecret() bool`

HasSecret returns a boolean if a field has been set.

### GetEndpointId

`func (o *InboundConfigsIdPutRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *InboundConfigsIdPutRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *InboundConfigsIdPutRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.

### HasEndpointId

`func (o *InboundConfigsIdPutRequest) HasEndpointId() bool`

HasEndpointId returns a boolean if a field has been set.

### SetEndpointIdNil

`func (o *InboundConfigsIdPutRequest) SetEndpointIdNil(b bool)`

 SetEndpointIdNil sets the value for EndpointId to be an explicit nil

### UnsetEndpointId
`func (o *InboundConfigsIdPutRequest) UnsetEndpointId()`

UnsetEndpointId ensures that no value is present for EndpointId, not even an explicit nil
### GetEnabled

`func (o *InboundConfigsIdPutRequest) GetEnabled() bool`

GetEnabled returns the Enabled field if non-nil, zero value otherwise.

### GetEnabledOk

`func (o *InboundConfigsIdPutRequest) GetEnabledOk() (*bool, bool)`

GetEnabledOk returns a tuple with the Enabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabled

`func (o *InboundConfigsIdPutRequest) SetEnabled(v bool)`

SetEnabled sets Enabled field to given value.

### HasEnabled

`func (o *InboundConfigsIdPutRequest) HasEnabled() bool`

HasEnabled returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


