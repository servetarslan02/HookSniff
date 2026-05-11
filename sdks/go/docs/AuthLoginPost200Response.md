# AuthLoginPost200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Token** | **string** | JWT access token | 
**Customer** | [**CustomerResponse**](CustomerResponse.md) |  | 
**RefreshToken** | Pointer to **string** | Refresh token (when applicable) | [optional] 
**Requires2fa** | **bool** |  | 
**TempToken** | **string** |  | 
**Message** | **string** |  | 

## Methods

### NewAuthLoginPost200Response

`func NewAuthLoginPost200Response(token string, customer CustomerResponse, requires2fa bool, tempToken string, message string, ) *AuthLoginPost200Response`

NewAuthLoginPost200Response instantiates a new AuthLoginPost200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAuthLoginPost200ResponseWithDefaults

`func NewAuthLoginPost200ResponseWithDefaults() *AuthLoginPost200Response`

NewAuthLoginPost200ResponseWithDefaults instantiates a new AuthLoginPost200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetToken

`func (o *AuthLoginPost200Response) GetToken() string`

GetToken returns the Token field if non-nil, zero value otherwise.

### GetTokenOk

`func (o *AuthLoginPost200Response) GetTokenOk() (*string, bool)`

GetTokenOk returns a tuple with the Token field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToken

`func (o *AuthLoginPost200Response) SetToken(v string)`

SetToken sets Token field to given value.


### GetCustomer

`func (o *AuthLoginPost200Response) GetCustomer() CustomerResponse`

GetCustomer returns the Customer field if non-nil, zero value otherwise.

### GetCustomerOk

`func (o *AuthLoginPost200Response) GetCustomerOk() (*CustomerResponse, bool)`

GetCustomerOk returns a tuple with the Customer field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomer

`func (o *AuthLoginPost200Response) SetCustomer(v CustomerResponse)`

SetCustomer sets Customer field to given value.


### GetRefreshToken

`func (o *AuthLoginPost200Response) GetRefreshToken() string`

GetRefreshToken returns the RefreshToken field if non-nil, zero value otherwise.

### GetRefreshTokenOk

`func (o *AuthLoginPost200Response) GetRefreshTokenOk() (*string, bool)`

GetRefreshTokenOk returns a tuple with the RefreshToken field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRefreshToken

`func (o *AuthLoginPost200Response) SetRefreshToken(v string)`

SetRefreshToken sets RefreshToken field to given value.

### HasRefreshToken

`func (o *AuthLoginPost200Response) HasRefreshToken() bool`

HasRefreshToken returns a boolean if a field has been set.

### GetRequires2fa

`func (o *AuthLoginPost200Response) GetRequires2fa() bool`

GetRequires2fa returns the Requires2fa field if non-nil, zero value otherwise.

### GetRequires2faOk

`func (o *AuthLoginPost200Response) GetRequires2faOk() (*bool, bool)`

GetRequires2faOk returns a tuple with the Requires2fa field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRequires2fa

`func (o *AuthLoginPost200Response) SetRequires2fa(v bool)`

SetRequires2fa sets Requires2fa field to given value.


### GetTempToken

`func (o *AuthLoginPost200Response) GetTempToken() string`

GetTempToken returns the TempToken field if non-nil, zero value otherwise.

### GetTempTokenOk

`func (o *AuthLoginPost200Response) GetTempTokenOk() (*string, bool)`

GetTempTokenOk returns a tuple with the TempToken field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTempToken

`func (o *AuthLoginPost200Response) SetTempToken(v string)`

SetTempToken sets TempToken field to given value.


### GetMessage

`func (o *AuthLoginPost200Response) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *AuthLoginPost200Response) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *AuthLoginPost200Response) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


