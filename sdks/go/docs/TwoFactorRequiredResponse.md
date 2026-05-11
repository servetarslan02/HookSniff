# TwoFactorRequiredResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Requires2fa** | **bool** |  | 
**TempToken** | **string** |  | 
**Message** | **string** |  | 

## Methods

### NewTwoFactorRequiredResponse

`func NewTwoFactorRequiredResponse(requires2fa bool, tempToken string, message string, ) *TwoFactorRequiredResponse`

NewTwoFactorRequiredResponse instantiates a new TwoFactorRequiredResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTwoFactorRequiredResponseWithDefaults

`func NewTwoFactorRequiredResponseWithDefaults() *TwoFactorRequiredResponse`

NewTwoFactorRequiredResponseWithDefaults instantiates a new TwoFactorRequiredResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRequires2fa

`func (o *TwoFactorRequiredResponse) GetRequires2fa() bool`

GetRequires2fa returns the Requires2fa field if non-nil, zero value otherwise.

### GetRequires2faOk

`func (o *TwoFactorRequiredResponse) GetRequires2faOk() (*bool, bool)`

GetRequires2faOk returns a tuple with the Requires2fa field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRequires2fa

`func (o *TwoFactorRequiredResponse) SetRequires2fa(v bool)`

SetRequires2fa sets Requires2fa field to given value.


### GetTempToken

`func (o *TwoFactorRequiredResponse) GetTempToken() string`

GetTempToken returns the TempToken field if non-nil, zero value otherwise.

### GetTempTokenOk

`func (o *TwoFactorRequiredResponse) GetTempTokenOk() (*string, bool)`

GetTempTokenOk returns a tuple with the TempToken field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTempToken

`func (o *TwoFactorRequiredResponse) SetTempToken(v string)`

SetTempToken sets TempToken field to given value.


### GetMessage

`func (o *TwoFactorRequiredResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *TwoFactorRequiredResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *TwoFactorRequiredResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


