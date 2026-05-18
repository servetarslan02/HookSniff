# ServiceTokenCreateResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**Name** | Pointer to **NullableString** |  | [optional] 
**Token** | Pointer to **string** | Full token value (only shown once) | [optional] 
**TokenPrefix** | Pointer to **string** |  | [optional] 
**Message** | Pointer to **string** |  | [optional] 

## Methods

### NewServiceTokenCreateResponse

`func NewServiceTokenCreateResponse() *ServiceTokenCreateResponse`

NewServiceTokenCreateResponse instantiates a new ServiceTokenCreateResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewServiceTokenCreateResponseWithDefaults

`func NewServiceTokenCreateResponseWithDefaults() *ServiceTokenCreateResponse`

NewServiceTokenCreateResponseWithDefaults instantiates a new ServiceTokenCreateResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *ServiceTokenCreateResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ServiceTokenCreateResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ServiceTokenCreateResponse) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *ServiceTokenCreateResponse) HasId() bool`

HasId returns a boolean if a field has been set.

### GetName

`func (o *ServiceTokenCreateResponse) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *ServiceTokenCreateResponse) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *ServiceTokenCreateResponse) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *ServiceTokenCreateResponse) HasName() bool`

HasName returns a boolean if a field has been set.

### SetNameNil

`func (o *ServiceTokenCreateResponse) SetNameNil(b bool)`

 SetNameNil sets the value for Name to be an explicit nil

### UnsetName
`func (o *ServiceTokenCreateResponse) UnsetName()`

UnsetName ensures that no value is present for Name, not even an explicit nil
### GetToken

`func (o *ServiceTokenCreateResponse) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *ServiceTokenCreateResponse) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *ServiceTokenCreateResponse) SetToken(v string)`

SetToken sets Token field to given value.

### HasToken

`func (o *ServiceTokenCreateResponse) HasToken() bool`

HasToken returns a boolean if a field has been set.

### GetTokenPrefix

`func (o *ServiceTokenCreateResponse) GetTokenPrefix() string`

GetTokenPrefix returns the TokenPrefix field if non-nil, zero value otherwise.

### GetTokenPrefixOk

`func (o *ServiceTokenCreateResponse) GetTokenPrefixOk() (*string, bool)`

GetTokenPrefixOk returns a tuple with the TokenPrefix field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTokenPrefix

`func (o *ServiceTokenCreateResponse) SetTokenPrefix(v string)`

SetTokenPrefix sets TokenPrefix field to given value.

### HasTokenPrefix

`func (o *ServiceTokenCreateResponse) HasTokenPrefix() bool`

HasTokenPrefix returns a boolean if a field has been set.

### GetMessage

`func (o *ServiceTokenCreateResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *ServiceTokenCreateResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *ServiceTokenCreateResponse) SetMessage(v string)`

SetMessage sets Message field to given value.

### HasMessage

`func (o *ServiceTokenCreateResponse) HasMessage() bool`

HasMessage returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


