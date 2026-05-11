# UpgradeResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CheckoutUrl** | Pointer to **NullableString** |  | [optional] 
**Provider** | **string** |  | 
**Message** | **string** |  | 

## Methods

### NewUpgradeResponse

`func NewUpgradeResponse(provider string, message string, ) *UpgradeResponse`

NewUpgradeResponse instantiates a new UpgradeResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpgradeResponseWithDefaults

`func NewUpgradeResponseWithDefaults() *UpgradeResponse`

NewUpgradeResponseWithDefaults instantiates a new UpgradeResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCheckoutUrl

`func (o *UpgradeResponse) GetCheckoutUrl() string`

GetCheckoutUrl returns the CheckoutUrl field if non-nil, zero value otherwise.

### GetCheckoutUrlOk

`func (o *UpgradeResponse) GetCheckoutUrlOk() (*string, bool)`

GetCheckoutUrlOk returns a tuple with the CheckoutUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCheckoutUrl

`func (o *UpgradeResponse) SetCheckoutUrl(v string)`

SetCheckoutUrl sets CheckoutUrl field to given value.

### HasCheckoutUrl

`func (o *UpgradeResponse) HasCheckoutUrl() bool`

HasCheckoutUrl returns a boolean if a field has been set.

### SetCheckoutUrlNil

`func (o *UpgradeResponse) SetCheckoutUrlNil(b bool)`

 SetCheckoutUrlNil sets the value for CheckoutUrl to be an explicit nil

### UnsetCheckoutUrl
`func (o *UpgradeResponse) UnsetCheckoutUrl()`

UnsetCheckoutUrl ensures that no value is present for CheckoutUrl, not even an explicit nil
### GetProvider

`func (o *UpgradeResponse) GetProvider() string`

GetProvider returns the Provider field if non-nil, zero value otherwise.

### GetProviderOk

`func (o *UpgradeResponse) GetProviderOk() (*string, bool)`

GetProviderOk returns a tuple with the Provider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProvider

`func (o *UpgradeResponse) SetProvider(v string)`

SetProvider sets Provider field to given value.


### GetMessage

`func (o *UpgradeResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *UpgradeResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *UpgradeResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


