# UpdateEndpointRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Url** | Pointer to **string** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 
**IsActive** | Pointer to **bool** |  | [optional] 
**AllowedIps** | Pointer to **[]string** |  | [optional] 
**EventFilter** | Pointer to **[]string** |  | [optional] 
**CustomHeaders** | Pointer to **map[string]interface{}** |  | [optional] 
**RetryPolicy** | Pointer to [**RetryPolicy**](RetryPolicy.md) |  | [optional] 
**RoutingStrategy** | Pointer to **string** |  | [optional] 
**FallbackUrl** | Pointer to **string** |  | [optional] 
**Format** | Pointer to **string** |  | [optional] 

## Methods

### NewUpdateEndpointRequest

`func NewUpdateEndpointRequest() *UpdateEndpointRequest`

NewUpdateEndpointRequest instantiates a new UpdateEndpointRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateEndpointRequestWithDefaults

`func NewUpdateEndpointRequestWithDefaults() *UpdateEndpointRequest`

NewUpdateEndpointRequestWithDefaults instantiates a new UpdateEndpointRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUrl

`func (o *UpdateEndpointRequest) GetUrl() string`

GetUrl returns the Url field if non-nil, zero value otherwise.

### GetUrlOk

`func (o *UpdateEndpointRequest) GetUrlOk() (*string, bool)`

GetUrlOk returns a tuple with the Url field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUrl

`func (o *UpdateEndpointRequest) SetUrl(v string)`

SetUrl sets Url field to given value.

### HasUrl

`func (o *UpdateEndpointRequest) HasUrl() bool`

HasUrl returns a boolean if a field has been set.

### GetDescription

`func (o *UpdateEndpointRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *UpdateEndpointRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *UpdateEndpointRequest) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *UpdateEndpointRequest) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetIsActive

`func (o *UpdateEndpointRequest) GetIsActive() bool`

GetIsActive returns the IsActive field if non-nil, zero value otherwise.

### GetIsActiveOk

`func (o *UpdateEndpointRequest) GetIsActiveOk() (*bool, bool)`

GetIsActiveOk returns a tuple with the IsActive field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsActive

`func (o *UpdateEndpointRequest) SetIsActive(v bool)`

SetIsActive sets IsActive field to given value.

### HasIsActive

`func (o *UpdateEndpointRequest) HasIsActive() bool`

HasIsActive returns a boolean if a field has been set.

### GetAllowedIps

`func (o *UpdateEndpointRequest) GetAllowedIps() []string`

GetAllowedIps returns the AllowedIps field if non-nil, zero value otherwise.

### GetAllowedIpsOk

`func (o *UpdateEndpointRequest) GetAllowedIpsOk() (*[]string, bool)`

GetAllowedIpsOk returns a tuple with the AllowedIps field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAllowedIps

`func (o *UpdateEndpointRequest) SetAllowedIps(v []string)`

SetAllowedIps sets AllowedIps field to given value.

### HasAllowedIps

`func (o *UpdateEndpointRequest) HasAllowedIps() bool`

HasAllowedIps returns a boolean if a field has been set.

### GetEventFilter

`func (o *UpdateEndpointRequest) GetEventFilter() []string`

GetEventFilter returns the EventFilter field if non-nil, zero value otherwise.

### GetEventFilterOk

`func (o *UpdateEndpointRequest) GetEventFilterOk() (*[]string, bool)`

GetEventFilterOk returns a tuple with the EventFilter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventFilter

`func (o *UpdateEndpointRequest) SetEventFilter(v []string)`

SetEventFilter sets EventFilter field to given value.

### HasEventFilter

`func (o *UpdateEndpointRequest) HasEventFilter() bool`

HasEventFilter returns a boolean if a field has been set.

### GetCustomHeaders

`func (o *UpdateEndpointRequest) GetCustomHeaders() map[string]interface{}`

GetCustomHeaders returns the CustomHeaders field if non-nil, zero value otherwise.

### GetCustomHeadersOk

`func (o *UpdateEndpointRequest) GetCustomHeadersOk() (*map[string]interface{}, bool)`

GetCustomHeadersOk returns a tuple with the CustomHeaders field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomHeaders

`func (o *UpdateEndpointRequest) SetCustomHeaders(v map[string]interface{})`

SetCustomHeaders sets CustomHeaders field to given value.

### HasCustomHeaders

`func (o *UpdateEndpointRequest) HasCustomHeaders() bool`

HasCustomHeaders returns a boolean if a field has been set.

### GetRetryPolicy

`func (o *UpdateEndpointRequest) GetRetryPolicy() RetryPolicy`

GetRetryPolicy returns the RetryPolicy field if non-nil, zero value otherwise.

### GetRetryPolicyOk

`func (o *UpdateEndpointRequest) GetRetryPolicyOk() (*RetryPolicy, bool)`

GetRetryPolicyOk returns a tuple with the RetryPolicy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRetryPolicy

`func (o *UpdateEndpointRequest) SetRetryPolicy(v RetryPolicy)`

SetRetryPolicy sets RetryPolicy field to given value.

### HasRetryPolicy

`func (o *UpdateEndpointRequest) HasRetryPolicy() bool`

HasRetryPolicy returns a boolean if a field has been set.

### GetRoutingStrategy

`func (o *UpdateEndpointRequest) GetRoutingStrategy() string`

GetRoutingStrategy returns the RoutingStrategy field if non-nil, zero value otherwise.

### GetRoutingStrategyOk

`func (o *UpdateEndpointRequest) GetRoutingStrategyOk() (*string, bool)`

GetRoutingStrategyOk returns a tuple with the RoutingStrategy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoutingStrategy

`func (o *UpdateEndpointRequest) SetRoutingStrategy(v string)`

SetRoutingStrategy sets RoutingStrategy field to given value.

### HasRoutingStrategy

`func (o *UpdateEndpointRequest) HasRoutingStrategy() bool`

HasRoutingStrategy returns a boolean if a field has been set.

### GetFallbackUrl

`func (o *UpdateEndpointRequest) GetFallbackUrl() string`

GetFallbackUrl returns the FallbackUrl field if non-nil, zero value otherwise.

### GetFallbackUrlOk

`func (o *UpdateEndpointRequest) GetFallbackUrlOk() (*string, bool)`

GetFallbackUrlOk returns a tuple with the FallbackUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFallbackUrl

`func (o *UpdateEndpointRequest) SetFallbackUrl(v string)`

SetFallbackUrl sets FallbackUrl field to given value.

### HasFallbackUrl

`func (o *UpdateEndpointRequest) HasFallbackUrl() bool`

HasFallbackUrl returns a boolean if a field has been set.

### GetFormat

`func (o *UpdateEndpointRequest) GetFormat() string`

GetFormat returns the Format field if non-nil, zero value otherwise.

### GetFormatOk

`func (o *UpdateEndpointRequest) GetFormatOk() (*string, bool)`

GetFormatOk returns a tuple with the Format field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFormat

`func (o *UpdateEndpointRequest) SetFormat(v string)`

SetFormat sets Format field to given value.

### HasFormat

`func (o *UpdateEndpointRequest) HasFormat() bool`

HasFormat returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


