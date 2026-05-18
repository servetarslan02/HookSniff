# Auth2faStatusGet200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Enabled** | Pointer to **bool** |  | [optional] 
**LastUsedAt** | Pointer to **NullableTime** |  | [optional] 

## Methods

### NewAuth2faStatusGet200Response

`func NewAuth2faStatusGet200Response() *Auth2faStatusGet200Response`

NewAuth2faStatusGet200Response instantiates a new Auth2faStatusGet200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAuth2faStatusGet200ResponseWithDefaults

`func NewAuth2faStatusGet200ResponseWithDefaults() *Auth2faStatusGet200Response`

NewAuth2faStatusGet200ResponseWithDefaults instantiates a new Auth2faStatusGet200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEnabled

`func (o *Auth2faStatusGet200Response) GetEnabled() bool`

GetEnabled returns the Enabled field if non-nil, zero value otherwise.

### GetEnabledOk

`func (o *Auth2faStatusGet200Response) GetEnabledOk() (*bool, bool)`

GetEnabledOk returns a tuple with the Enabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabled

`func (o *Auth2faStatusGet200Response) SetEnabled(v bool)`

SetEnabled sets Enabled field to given value.

### HasEnabled

`func (o *Auth2faStatusGet200Response) HasEnabled() bool`

HasEnabled returns a boolean if a field has been set.

### GetLastUsedAt

`func (o *Auth2faStatusGet200Response) GetLastUsedAt() time.Time`

GetLastUsedAt returns the LastUsedAt field if non-nil, zero value otherwise.

### GetLastUsedAtOk

`func (o *Auth2faStatusGet200Response) GetLastUsedAtOk() (*time.Time, bool)`

GetLastUsedAtOk returns a tuple with the LastUsedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLastUsedAt

`func (o *Auth2faStatusGet200Response) SetLastUsedAt(v time.Time)`

SetLastUsedAt sets LastUsedAt field to given value.

### HasLastUsedAt

`func (o *Auth2faStatusGet200Response) HasLastUsedAt() bool`

HasLastUsedAt returns a boolean if a field has been set.

### SetLastUsedAtNil

`func (o *Auth2faStatusGet200Response) SetLastUsedAtNil(b bool)`

 SetLastUsedAtNil sets the value for LastUsedAt to be an explicit nil

### UnsetLastUsedAt
`func (o *Auth2faStatusGet200Response) UnsetLastUsedAt()`

UnsetLastUsedAt ensures that no value is present for LastUsedAt, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


