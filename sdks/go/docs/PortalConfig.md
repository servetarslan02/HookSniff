# PortalConfig

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**LogoUrl** | Pointer to **NullableString** |  | [optional] 
**PrimaryColor** | Pointer to **NullableString** | Hex color code (e.g. | [optional] 
**CustomDomain** | Pointer to **NullableString** |  | [optional] 
**WebhookEvents** | Pointer to **[]string** | Event types to expose in the portal | [optional] 

## Methods

### NewPortalConfig

`func NewPortalConfig() *PortalConfig`

NewPortalConfig instantiates a new PortalConfig object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPortalConfigWithDefaults

`func NewPortalConfigWithDefaults() *PortalConfig`

NewPortalConfigWithDefaults instantiates a new PortalConfig object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetLogoUrl

`func (o *PortalConfig) GetLogoUrl() string`

GetLogoUrl returns the LogoUrl field if non-nil, zero value otherwise.

### GetLogoUrlOk

`func (o *PortalConfig) GetLogoUrlOk() (*string, bool)`

GetLogoUrlOk returns a tuple with the LogoUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLogoUrl

`func (o *PortalConfig) SetLogoUrl(v string)`

SetLogoUrl sets LogoUrl field to given value.

### HasLogoUrl

`func (o *PortalConfig) HasLogoUrl() bool`

HasLogoUrl returns a boolean if a field has been set.

### SetLogoUrlNil

`func (o *PortalConfig) SetLogoUrlNil(b bool)`

 SetLogoUrlNil sets the value for LogoUrl to be an explicit nil

### UnsetLogoUrl
`func (o *PortalConfig) UnsetLogoUrl()`

UnsetLogoUrl ensures that no value is present for LogoUrl, not even an explicit nil
### GetPrimaryColor

`func (o *PortalConfig) GetPrimaryColor() string`

GetPrimaryColor returns the PrimaryColor field if non-nil, zero value otherwise.

### GetPrimaryColorOk

`func (o *PortalConfig) GetPrimaryColorOk() (*string, bool)`

GetPrimaryColorOk returns a tuple with the PrimaryColor field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPrimaryColor

`func (o *PortalConfig) SetPrimaryColor(v string)`

SetPrimaryColor sets PrimaryColor field to given value.

### HasPrimaryColor

`func (o *PortalConfig) HasPrimaryColor() bool`

HasPrimaryColor returns a boolean if a field has been set.

### SetPrimaryColorNil

`func (o *PortalConfig) SetPrimaryColorNil(b bool)`

 SetPrimaryColorNil sets the value for PrimaryColor to be an explicit nil

### UnsetPrimaryColor
`func (o *PortalConfig) UnsetPrimaryColor()`

UnsetPrimaryColor ensures that no value is present for PrimaryColor, not even an explicit nil
### GetCustomDomain

`func (o *PortalConfig) GetCustomDomain() string`

GetCustomDomain returns the CustomDomain field if non-nil, zero value otherwise.

### GetCustomDomainOk

`func (o *PortalConfig) GetCustomDomainOk() (*string, bool)`

GetCustomDomainOk returns a tuple with the CustomDomain field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomDomain

`func (o *PortalConfig) SetCustomDomain(v string)`

SetCustomDomain sets CustomDomain field to given value.

### HasCustomDomain

`func (o *PortalConfig) HasCustomDomain() bool`

HasCustomDomain returns a boolean if a field has been set.

### SetCustomDomainNil

`func (o *PortalConfig) SetCustomDomainNil(b bool)`

 SetCustomDomainNil sets the value for CustomDomain to be an explicit nil

### UnsetCustomDomain
`func (o *PortalConfig) UnsetCustomDomain()`

UnsetCustomDomain ensures that no value is present for CustomDomain, not even an explicit nil
### GetWebhookEvents

`func (o *PortalConfig) GetWebhookEvents() []string`

GetWebhookEvents returns the WebhookEvents field if non-nil, zero value otherwise.

### GetWebhookEventsOk

`func (o *PortalConfig) GetWebhookEventsOk() (*[]string, bool)`

GetWebhookEventsOk returns a tuple with the WebhookEvents field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookEvents

`func (o *PortalConfig) SetWebhookEvents(v []string)`

SetWebhookEvents sets WebhookEvents field to given value.

### HasWebhookEvents

`func (o *PortalConfig) HasWebhookEvents() bool`

HasWebhookEvents returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


