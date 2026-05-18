# SsoConfigPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Provider** | Pointer to **string** |  | [optional] 
**Enabled** | Pointer to **bool** |  | [optional] 

## Methods

### NewSsoConfigPostRequest

`func NewSsoConfigPostRequest() *SsoConfigPostRequest`

NewSsoConfigPostRequest instantiates a new SsoConfigPostRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSsoConfigPostRequestWithDefaults

`func NewSsoConfigPostRequestWithDefaults() *SsoConfigPostRequest`

NewSsoConfigPostRequestWithDefaults instantiates a new SsoConfigPostRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetProvider

`func (o *SsoConfigPostRequest) GetProvider() string`

GetProvider returns the Provider field if non-nil, zero value otherwise.

### GetProviderOk

`func (o *SsoConfigPostRequest) GetProviderOk() (*string, bool)`

GetProviderOk returns a tuple with the Provider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProvider

`func (o *SsoConfigPostRequest) SetProvider(v string)`

SetProvider sets Provider field to given value.

### HasProvider

`func (o *SsoConfigPostRequest) HasProvider() bool`

HasProvider returns a boolean if a field has been set.

### GetEnabled

`func (o *SsoConfigPostRequest) GetEnabled() bool`

GetEnabled returns the Enabled field if non-nil, zero value otherwise.

### GetEnabledOk

`func (o *SsoConfigPostRequest) GetEnabledOk() (*bool, bool)`

GetEnabledOk returns a tuple with the Enabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabled

`func (o *SsoConfigPostRequest) SetEnabled(v bool)`

SetEnabled sets Enabled field to given value.

### HasEnabled

`func (o *SsoConfigPostRequest) HasEnabled() bool`

HasEnabled returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


