# RegisterDeviceRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Token** | **string** | FCM device token | 
**Platform** | Pointer to **string** |  | [optional] 

## Methods

### NewRegisterDeviceRequest

`func NewRegisterDeviceRequest(token string, ) *RegisterDeviceRequest`

NewRegisterDeviceRequest instantiates a new RegisterDeviceRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRegisterDeviceRequestWithDefaults

`func NewRegisterDeviceRequestWithDefaults() *RegisterDeviceRequest`

NewRegisterDeviceRequestWithDefaults instantiates a new RegisterDeviceRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetToken

`func (o *RegisterDeviceRequest) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *RegisterDeviceRequest) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *RegisterDeviceRequest) SetToken(v string)`

SetToken sets Token field to given value.


### GetPlatform

`func (o *RegisterDeviceRequest) GetPlatform() string`

GetPlatform returns the Platform field if non-nil, zero value otherwise.

### GetPlatformOk

`func (o *RegisterDeviceRequest) GetPlatformOk() (*string, bool)`

GetPlatformOk returns a tuple with the Platform field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlatform

`func (o *RegisterDeviceRequest) SetPlatform(v string)`

SetPlatform sets Platform field to given value.

### HasPlatform

`func (o *RegisterDeviceRequest) HasPlatform() bool`

HasPlatform returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


