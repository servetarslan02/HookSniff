# CreateSSOConfigRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Provider** | **string** |  | 
**Domain** | **string** |  | 
**MetadataUrl** | **string** | URL to SAML metadata or OIDC discovery document | 

## Methods

### NewCreateSSOConfigRequest

`func NewCreateSSOConfigRequest(provider string, domain string, metadataUrl string, ) *CreateSSOConfigRequest`

NewCreateSSOConfigRequest instantiates a new CreateSSOConfigRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateSSOConfigRequestWithDefaults

`func NewCreateSSOConfigRequestWithDefaults() *CreateSSOConfigRequest`

NewCreateSSOConfigRequestWithDefaults instantiates a new CreateSSOConfigRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetProvider

`func (o *CreateSSOConfigRequest) GetProvider() string`

GetProvider returns the Provider field if non-nil, zero value otherwise.

### GetProviderOk

`func (o *CreateSSOConfigRequest) GetProviderOk() (*string, bool)`

GetProviderOk returns a tuple with the Provider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProvider

`func (o *CreateSSOConfigRequest) SetProvider(v string)`

SetProvider sets Provider field to given value.


### GetDomain

`func (o *CreateSSOConfigRequest) GetDomain() string`

GetDomain returns the Domain field if non-nil, zero value otherwise.

### GetDomainOk

`func (o *CreateSSOConfigRequest) GetDomainOk() (*string, bool)`

GetDomainOk returns a tuple with the Domain field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDomain

`func (o *CreateSSOConfigRequest) SetDomain(v string)`

SetDomain sets Domain field to given value.


### GetMetadataUrl

`func (o *CreateSSOConfigRequest) GetMetadataUrl() string`

GetMetadataUrl returns the MetadataUrl field if non-nil, zero value otherwise.

### GetMetadataUrlOk

`func (o *CreateSSOConfigRequest) GetMetadataUrlOk() (*string, bool)`

GetMetadataUrlOk returns a tuple with the MetadataUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadataUrl

`func (o *CreateSSOConfigRequest) SetMetadataUrl(v string)`

SetMetadataUrl sets MetadataUrl field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


