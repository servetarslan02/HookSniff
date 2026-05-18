# UpdateEndpointRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Url** | **string** |  | 
**Description** | **string** |  | 
**IsActive** | **bool** |  | 
**AllowedIps** | **[]string** |  | 
**EventFilter** | **[]string** |  | 
**CustomHeaders** | Pointer to **map[string]interface{}** |  | [optional] 
**RetryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  | 
**RoutingStrategy** | **string** |  | 
**FallbackUrl** | **string** |  | 
**Format** | **string** |  | 

## Methods

### NewUpdateEndpointRequest

`func NewUpdateEndpointRequest(url string, description string, isActive bool, allowedIps []string, eventFilter []string, retryPolicy RetryPolicy, routingStrategy string, fallbackUrl string, format string, ) *UpdateEndpointRequest`

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



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


