# CreateEndpointRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Url** | **string** |  | 
**Description** | Pointer to **string** |  | [optional] 
**AllowedIps** | Pointer to **[]string** |  | [optional] 
**EventFilter** | Pointer to **[]string** |  | [optional] 
**CustomHeaders** | Pointer to **map[string]interface{}** |  | [optional] 
**RetryPolicy** | Pointer to [**RetryPolicy**](RetryPolicy.md) |  | [optional] 
**RoutingStrategy** | Pointer to **string** |  | [optional] 
**FallbackUrl** | Pointer to **string** |  | [optional] 
**Format** | Pointer to **string** |  | [optional] [default to "standard"]

## Methods

### NewCreateEndpointRequest

`func NewCreateEndpointRequest(url string, ) *CreateEndpointRequest`

NewCreateEndpointRequest instantiates a new CreateEndpointRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateEndpointRequestWithDefaults

`func NewCreateEndpointRequestWithDefaults() *CreateEndpointRequest`

NewCreateEndpointRequestWithDefaults instantiates a new CreateEndpointRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUrl

`func (o *CreateEndpointRequest) GetUrl() string`

GetUrl returns the Url field if non-nil, zero value otherwise.

### GetUrlOk

`func (o *CreateEndpointRequest) GetUrlOk() (*string, bool)`

GetUrlOk returns a tuple with the Url field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUrl

`func (o *CreateEndpointRequest) SetUrl(v string)`

SetUrl sets Url field to given value.


### GetDescription

`func (o *CreateEndpointRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *CreateEndpointRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *CreateEndpointRequest) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *CreateEndpointRequest) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetAllowedIps

`func (o *CreateEndpointRequest) GetAllowedIps() []string`

GetAllowedIps returns the AllowedIps field if non-nil, zero value otherwise.

### GetAllowedIpsOk

`func (o *CreateEndpointRequest) GetAllowedIpsOk() (*[]string, bool)`

GetAllowedIpsOk returns a tuple with the AllowedIps field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAllowedIps

`func (o *CreateEndpointRequest) SetAllowedIps(v []string)`

SetAllowedIps sets AllowedIps field to given value.

### HasAllowedIps

`func (o *CreateEndpointRequest) HasAllowedIps() bool`

HasAllowedIps returns a boolean if a field has been set.

### GetEventFilter

`func (o *CreateEndpointRequest) GetEventFilter() []string`

GetEventFilter returns the EventFilter field if non-nil, zero value otherwise.

### GetEventFilterOk

`func (o *CreateEndpointRequest) GetEventFilterOk() (*[]string, bool)`

GetEventFilterOk returns a tuple with the EventFilter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventFilter

`func (o *CreateEndpointRequest) SetEventFilter(v []string)`

SetEventFilter sets EventFilter field to given value.

### HasEventFilter

`func (o *CreateEndpointRequest) HasEventFilter() bool`

HasEventFilter returns a boolean if a field has been set.

### GetCustomHeaders

`func (o *CreateEndpointRequest) GetCustomHeaders() map[string]interface{}`

GetCustomHeaders returns the CustomHeaders field if non-nil, zero value otherwise.

### GetCustomHeadersOk

`func (o *CreateEndpointRequest) GetCustomHeadersOk() (*map[string]interface{}, bool)`

GetCustomHeadersOk returns a tuple with the CustomHeaders field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomHeaders

`func (o *CreateEndpointRequest) SetCustomHeaders(v map[string]interface{})`

SetCustomHeaders sets CustomHeaders field to given value.

### HasCustomHeaders

`func (o *CreateEndpointRequest) HasCustomHeaders() bool`

HasCustomHeaders returns a boolean if a field has been set.

### GetRetryPolicy

`func (o *CreateEndpointRequest) GetRetryPolicy() RetryPolicy`

GetRetryPolicy returns the RetryPolicy field if non-nil, zero value otherwise.

### GetRetryPolicyOk

`func (o *CreateEndpointRequest) GetRetryPolicyOk() (*RetryPolicy, bool)`

GetRetryPolicyOk returns a tuple with the RetryPolicy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRetryPolicy

`func (o *CreateEndpointRequest) SetRetryPolicy(v RetryPolicy)`

SetRetryPolicy sets RetryPolicy field to given value.

### HasRetryPolicy

`func (o *CreateEndpointRequest) HasRetryPolicy() bool`

HasRetryPolicy returns a boolean if a field has been set.

### GetRoutingStrategy

`func (o *CreateEndpointRequest) GetRoutingStrategy() string`

GetRoutingStrategy returns the RoutingStrategy field if non-nil, zero value otherwise.

### GetRoutingStrategyOk

`func (o *CreateEndpointRequest) GetRoutingStrategyOk() (*string, bool)`

GetRoutingStrategyOk returns a tuple with the RoutingStrategy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoutingStrategy

`func (o *CreateEndpointRequest) SetRoutingStrategy(v string)`

SetRoutingStrategy sets RoutingStrategy field to given value.

### HasRoutingStrategy

`func (o *CreateEndpointRequest) HasRoutingStrategy() bool`

HasRoutingStrategy returns a boolean if a field has been set.

### GetFallbackUrl

`func (o *CreateEndpointRequest) GetFallbackUrl() string`

GetFallbackUrl returns the FallbackUrl field if non-nil, zero value otherwise.

### GetFallbackUrlOk

`func (o *CreateEndpointRequest) GetFallbackUrlOk() (*string, bool)`

GetFallbackUrlOk returns a tuple with the FallbackUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFallbackUrl

`func (o *CreateEndpointRequest) SetFallbackUrl(v string)`

SetFallbackUrl sets FallbackUrl field to given value.

### HasFallbackUrl

`func (o *CreateEndpointRequest) HasFallbackUrl() bool`

HasFallbackUrl returns a boolean if a field has been set.

### GetFormat

`func (o *CreateEndpointRequest) GetFormat() string`

GetFormat returns the Format field if non-nil, zero value otherwise.

### GetFormatOk

`func (o *CreateEndpointRequest) GetFormatOk() (*string, bool)`

GetFormatOk returns a tuple with the Format field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFormat

`func (o *CreateEndpointRequest) SetFormat(v string)`

SetFormat sets Format field to given value.

### HasFormat

`func (o *CreateEndpointRequest) HasFormat() bool`

HasFormat returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


