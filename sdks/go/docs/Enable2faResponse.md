# Enable2faResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Secret** | **string** | TOTP secret key | 
**QrUrl** | **string** | QR code provisioning URL | 

## Methods

### NewEnable2faResponse

`func NewEnable2faResponse(secret string, qrUrl string, ) *Enable2faResponse`

NewEnable2faResponse instantiates a new Enable2faResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEnable2faResponseWithDefaults

`func NewEnable2faResponseWithDefaults() *Enable2faResponse`

NewEnable2faResponseWithDefaults instantiates a new Enable2faResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSecret

`func (o *Enable2faResponse) GetSecret() string`

GetSecret returns the Secret field if non-nil, zero value otherwise.

### GetSecretOk

`func (o *Enable2faResponse) GetSecretOk() (*string, bool)`

GetSecretOk returns a tuple with the Secret field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSecret

`func (o *Enable2faResponse) SetSecret(v string)`

SetSecret sets Secret field to given value.


### GetQrUrl

`func (o *Enable2faResponse) GetQrUrl() string`

GetQrUrl returns the QrUrl field if non-nil, zero value otherwise.

### GetQrUrlOk

`func (o *Enable2faResponse) GetQrUrlOk() (*string, bool)`

GetQrUrlOk returns a tuple with the QrUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQrUrl

`func (o *Enable2faResponse) SetQrUrl(v string)`

SetQrUrl sets QrUrl field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


