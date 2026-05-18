# AuthConsentPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Key** | **string** | Consent key (e.g. cookie_consent, marketing_consent) | 
**Value** | **bool** |  | 

## Methods

### NewAuthConsentPostRequest

`func NewAuthConsentPostRequest(key string, value bool, ) *AuthConsentPostRequest`

NewAuthConsentPostRequest instantiates a new AuthConsentPostRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAuthConsentPostRequestWithDefaults

`func NewAuthConsentPostRequestWithDefaults() *AuthConsentPostRequest`

NewAuthConsentPostRequestWithDefaults instantiates a new AuthConsentPostRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetKey

`func (o *AuthConsentPostRequest) GetKey() string`

GetKey returns the Key field if non-nil, zero value otherwise.

### GetKeyOk

`func (o *AuthConsentPostRequest) GetKeyOk() (*string, bool)`

GetKeyOk returns a tuple with the Key field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetKey

`func (o *AuthConsentPostRequest) SetKey(v string)`

SetKey sets Key field to given value.


### GetValue

`func (o *AuthConsentPostRequest) GetValue() bool`

GetValue returns the Value field if non-nil, zero value otherwise.

### GetValueOk

`func (o *AuthConsentPostRequest) GetValueOk() (*bool, bool)`

GetValueOk returns a tuple with the Value field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValue

`func (o *AuthConsentPostRequest) SetValue(v bool)`

SetValue sets Value field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


