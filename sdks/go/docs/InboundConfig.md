# InboundConfig

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**CustomerId** | Pointer to **string** |  | [optional] 
**Provider** | Pointer to **string** | Provider name (stripe, github, shopify, generic) | [optional] 
**Secret** | Pointer to **string** | Webhook signing secret | [optional] 
**EndpointId** | Pointer to **NullableString** |  | [optional] 
**Enabled** | Pointer to **bool** |  | [optional] 
**CreatedAt** | Pointer to **time.Time** |  | [optional] 

## Methods

### NewInboundConfig

`func NewInboundConfig() *InboundConfig`

NewInboundConfig instantiates a new InboundConfig object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInboundConfigWithDefaults

`func NewInboundConfigWithDefaults() *InboundConfig`

NewInboundConfigWithDefaults instantiates a new InboundConfig object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *InboundConfig) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *InboundConfig) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *InboundConfig) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *InboundConfig) HasId() bool`

HasId returns a boolean if a field has been set.

### GetCustomerId

`func (o *InboundConfig) GetCustomerId() string`

GetCustomerId returns the CustomerId field if non-nil, zero value otherwise.

### GetCustomerIdOk

`func (o *InboundConfig) GetCustomerIdOk() (*string, bool)`

GetCustomerIdOk returns a tuple with the CustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomerId

`func (o *InboundConfig) SetCustomerId(v string)`

SetCustomerId sets CustomerId field to given value.

### HasCustomerId

`func (o *InboundConfig) HasCustomerId() bool`

HasCustomerId returns a boolean if a field has been set.

### GetProvider

`func (o *InboundConfig) GetProvider() string`

GetProvider returns the Provider field if non-nil, zero value otherwise.

### GetProviderOk

`func (o *InboundConfig) GetProviderOk() (*string, bool)`

GetProviderOk returns a tuple with the Provider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProvider

`func (o *InboundConfig) SetProvider(v string)`

SetProvider sets Provider field to given value.

### HasProvider

`func (o *InboundConfig) HasProvider() bool`

HasProvider returns a boolean if a field has been set.

### GetSecret

`func (o *InboundConfig) GetSecret() string`

GetSecret returns the Secret field if non-nil, zero value otherwise.

### GetSecretOk

`func (o *InboundConfig) GetSecretOk() (*string, bool)`

GetSecretOk returns a tuple with the Secret field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSecret

`func (o *InboundConfig) SetSecret(v string)`

SetSecret sets Secret field to given value.

### HasSecret

`func (o *InboundConfig) HasSecret() bool`

HasSecret returns a boolean if a field has been set.

### GetEndpointId

`func (o *InboundConfig) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *InboundConfig) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *InboundConfig) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.

### HasEndpointId

`func (o *InboundConfig) HasEndpointId() bool`

HasEndpointId returns a boolean if a field has been set.

### SetEndpointIdNil

`func (o *InboundConfig) SetEndpointIdNil(b bool)`

 SetEndpointIdNil sets the value for EndpointId to be an explicit nil

### UnsetEndpointId
`func (o *InboundConfig) UnsetEndpointId()`

UnsetEndpointId ensures that no value is present for EndpointId, not even an explicit nil
### GetEnabled

`func (o *InboundConfig) GetEnabled() bool`

GetEnabled returns the Enabled field if non-nil, zero value otherwise.

### GetEnabledOk

`func (o *InboundConfig) GetEnabledOk() (*bool, bool)`

GetEnabledOk returns a tuple with the Enabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabled

`func (o *InboundConfig) SetEnabled(v bool)`

SetEnabled sets Enabled field to given value.

### HasEnabled

`func (o *InboundConfig) HasEnabled() bool`

HasEnabled returns a boolean if a field has been set.

### GetCreatedAt

`func (o *InboundConfig) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *InboundConfig) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *InboundConfig) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *InboundConfig) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


