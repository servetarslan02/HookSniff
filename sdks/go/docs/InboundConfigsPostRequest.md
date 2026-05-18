# InboundConfigsPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Provider** | **string** | Provider name (stripe, github, shopify, generic) | 
**Secret** | **string** | Webhook signing secret | 
**EndpointId** | Pointer to **NullableString** | Default target endpoint | [optional] 
**Enabled** | Pointer to **bool** |  | [optional] [default to true]

## Methods

### NewInboundConfigsPostRequest

`func NewInboundConfigsPostRequest(provider string, secret string, ) *InboundConfigsPostRequest`

NewInboundConfigsPostRequest instantiates a new InboundConfigsPostRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInboundConfigsPostRequestWithDefaults

`func NewInboundConfigsPostRequestWithDefaults() *InboundConfigsPostRequest`

NewInboundConfigsPostRequestWithDefaults instantiates a new InboundConfigsPostRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetProvider

`func (o *InboundConfigsPostRequest) GetProvider() string`

GetProvider returns the Provider field if non-nil, zero value otherwise.

### GetProviderOk

`func (o *InboundConfigsPostRequest) GetProviderOk() (*string, bool)`

GetProviderOk returns a tuple with the Provider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProvider

`func (o *InboundConfigsPostRequest) SetProvider(v string)`

SetProvider sets Provider field to given value.


### GetSecret

`func (o *InboundConfigsPostRequest) GetSecret() string`

GetSecret returns the Secret field if non-nil, zero value otherwise.

### GetSecretOk

`func (o *InboundConfigsPostRequest) GetSecretOk() (*string, bool)`

GetSecretOk returns a tuple with the Secret field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSecret

`func (o *InboundConfigsPostRequest) SetSecret(v string)`

SetSecret sets Secret field to given value.


### GetEndpointId

`func (o *InboundConfigsPostRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *InboundConfigsPostRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *InboundConfigsPostRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.

### HasEndpointId

`func (o *InboundConfigsPostRequest) HasEndpointId() bool`

HasEndpointId returns a boolean if a field has been set.

### SetEndpointIdNil

`func (o *InboundConfigsPostRequest) SetEndpointIdNil(b bool)`

 SetEndpointIdNil sets the value for EndpointId to be an explicit nil

### UnsetEndpointId
`func (o *InboundConfigsPostRequest) UnsetEndpointId()`

UnsetEndpointId ensures that no value is present for EndpointId, not even an explicit nil
### GetEnabled

`func (o *InboundConfigsPostRequest) GetEnabled() bool`

GetEnabled returns the Enabled field if non-nil, zero value otherwise.

### GetEnabledOk

`func (o *InboundConfigsPostRequest) GetEnabledOk() (*bool, bool)`

GetEnabledOk returns a tuple with the Enabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabled

`func (o *InboundConfigsPostRequest) SetEnabled(v bool)`

SetEnabled sets Enabled field to given value.

### HasEnabled

`func (o *InboundConfigsPostRequest) HasEnabled() bool`

HasEnabled returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


