# EmbedConfig

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AllowedOrigins** | **[]string** | CORS origins allowed to load the embed | 
**Theme** | Pointer to [**EmbedConfigTheme**](EmbedConfigTheme.md) |  | [optional] 
**Features** | Pointer to **[]string** | Enabled features (e.g. [deliveries, endpoints, playground]) | [optional] 

## Methods

### NewEmbedConfig

`func NewEmbedConfig(allowedOrigins []string, ) *EmbedConfig`

NewEmbedConfig instantiates a new EmbedConfig object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEmbedConfigWithDefaults

`func NewEmbedConfigWithDefaults() *EmbedConfig`

NewEmbedConfigWithDefaults instantiates a new EmbedConfig object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAllowedOrigins

`func (o *EmbedConfig) GetAllowedOrigins() []string`

GetAllowedOrigins returns the AllowedOrigins field if non-nil, zero value otherwise.

### GetAllowedOriginsOk

`func (o *EmbedConfig) GetAllowedOriginsOk() (*[]string, bool)`

GetAllowedOriginsOk returns a tuple with the AllowedOrigins field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAllowedOrigins

`func (o *EmbedConfig) SetAllowedOrigins(v []string)`

SetAllowedOrigins sets AllowedOrigins field to given value.


### GetTheme

`func (o *EmbedConfig) GetTheme() EmbedConfigTheme`

GetTheme returns the Theme field if non-nil, zero value otherwise.

### GetThemeOk

`func (o *EmbedConfig) GetThemeOk() (*EmbedConfigTheme, bool)`

GetThemeOk returns a tuple with the Theme field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTheme

`func (o *EmbedConfig) SetTheme(v EmbedConfigTheme)`

SetTheme sets Theme field to given value.

### HasTheme

`func (o *EmbedConfig) HasTheme() bool`

HasTheme returns a boolean if a field has been set.

### GetFeatures

`func (o *EmbedConfig) GetFeatures() []string`

GetFeatures returns the Features field if non-nil, zero value otherwise.

### GetFeaturesOk

`func (o *EmbedConfig) GetFeaturesOk() (*[]string, bool)`

GetFeaturesOk returns a tuple with the Features field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFeatures

`func (o *EmbedConfig) SetFeatures(v []string)`

SetFeatures sets Features field to given value.

### HasFeatures

`func (o *EmbedConfig) HasFeatures() bool`

HasFeatures returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


