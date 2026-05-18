# Endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Url** | **string** |  | 
**Description** | Pointer to **NullableString** |  | [optional] 
**IsActive** | **bool** |  | 
**RetryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  | 
**CreatedAt** | **time.Time** |  | 
**AllowedIps** | Pointer to **[]string** | CIDR blocks or exact IPs | [optional] 
**EventFilter** | Pointer to **[]string** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional] 
**CustomHeaders** | Pointer to **map[string]interface{}** |  | [optional] 
**RoutingStrategy** | **string** |  | 
**FallbackUrl** | Pointer to **NullableString** |  | [optional] 
**AvgResponseMs** | **int32** |  | 
**FailureStreak** | **int32** |  | 
**Format** | **string** |  | 

## Methods

### NewEndpoint

`func NewEndpoint(id string, url string, isActive bool, retryPolicy RetryPolicy, createdAt time.Time, routingStrategy string, avgResponseMs int32, failureStreak int32, format string, ) *Endpoint`

NewEndpoint instantiates a new Endpoint object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEndpointWithDefaults

`func NewEndpointWithDefaults() *Endpoint`

NewEndpointWithDefaults instantiates a new Endpoint object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *Endpoint) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Endpoint) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Endpoint) SetId(v string)`

SetId sets Id field to given value.


### GetUrl

`func (o *Endpoint) GetUrl() string`

GetUrl returns the Url field if non-nil, zero value otherwise.

### GetUrlOk

`func (o *Endpoint) GetUrlOk() (*string, bool)`

GetUrlOk returns a tuple with the Url field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUrl

`func (o *Endpoint) SetUrl(v string)`

SetUrl sets Url field to given value.


### GetDescription

`func (o *Endpoint) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *Endpoint) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *Endpoint) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *Endpoint) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### SetDescriptionNil

`func (o *Endpoint) SetDescriptionNil(b bool)`

 SetDescriptionNil sets the value for Description to be an explicit nil

### UnsetDescription
`func (o *Endpoint) UnsetDescription()`

UnsetDescription ensures that no value is present for Description, not even an explicit nil
### GetIsActive

`func (o *Endpoint) GetIsActive() bool`

GetIsActive returns the IsActive field if non-nil, zero value otherwise.

### GetIsActiveOk

`func (o *Endpoint) GetIsActiveOk() (*bool, bool)`

GetIsActiveOk returns a tuple with the IsActive field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsActive

`func (o *Endpoint) SetIsActive(v bool)`

SetIsActive sets IsActive field to given value.


### GetRetryPolicy

`func (o *Endpoint) GetRetryPolicy() RetryPolicy`

GetRetryPolicy returns the RetryPolicy field if non-nil, zero value otherwise.

### GetRetryPolicyOk

`func (o *Endpoint) GetRetryPolicyOk() (*RetryPolicy, bool)`

GetRetryPolicyOk returns a tuple with the RetryPolicy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRetryPolicy

`func (o *Endpoint) SetRetryPolicy(v RetryPolicy)`

SetRetryPolicy sets RetryPolicy field to given value.


### GetCreatedAt

`func (o *Endpoint) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *Endpoint) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *Endpoint) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetAllowedIps

`func (o *Endpoint) GetAllowedIps() []string`

GetAllowedIps returns the AllowedIps field if non-nil, zero value otherwise.

### GetAllowedIpsOk

`func (o *Endpoint) GetAllowedIpsOk() (*[]string, bool)`

GetAllowedIpsOk returns a tuple with the AllowedIps field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAllowedIps

`func (o *Endpoint) SetAllowedIps(v []string)`

SetAllowedIps sets AllowedIps field to given value.

### HasAllowedIps

`func (o *Endpoint) HasAllowedIps() bool`

HasAllowedIps returns a boolean if a field has been set.

### SetAllowedIpsNil

`func (o *Endpoint) SetAllowedIpsNil(b bool)`

 SetAllowedIpsNil sets the value for AllowedIps to be an explicit nil

### UnsetAllowedIps
`func (o *Endpoint) UnsetAllowedIps()`

UnsetAllowedIps ensures that no value is present for AllowedIps, not even an explicit nil
### GetEventFilter

`func (o *Endpoint) GetEventFilter() []string`

GetEventFilter returns the EventFilter field if non-nil, zero value otherwise.

### GetEventFilterOk

`func (o *Endpoint) GetEventFilterOk() (*[]string, bool)`

GetEventFilterOk returns a tuple with the EventFilter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventFilter

`func (o *Endpoint) SetEventFilter(v []string)`

SetEventFilter sets EventFilter field to given value.

### HasEventFilter

`func (o *Endpoint) HasEventFilter() bool`

HasEventFilter returns a boolean if a field has been set.

### SetEventFilterNil

`func (o *Endpoint) SetEventFilterNil(b bool)`

 SetEventFilterNil sets the value for EventFilter to be an explicit nil

### UnsetEventFilter
`func (o *Endpoint) UnsetEventFilter()`

UnsetEventFilter ensures that no value is present for EventFilter, not even an explicit nil
### GetCustomHeaders

`func (o *Endpoint) GetCustomHeaders() map[string]interface{}`

GetCustomHeaders returns the CustomHeaders field if non-nil, zero value otherwise.

### GetCustomHeadersOk

`func (o *Endpoint) GetCustomHeadersOk() (*map[string]interface{}, bool)`

GetCustomHeadersOk returns a tuple with the CustomHeaders field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomHeaders

`func (o *Endpoint) SetCustomHeaders(v map[string]interface{})`

SetCustomHeaders sets CustomHeaders field to given value.

### HasCustomHeaders

`func (o *Endpoint) HasCustomHeaders() bool`

HasCustomHeaders returns a boolean if a field has been set.

### SetCustomHeadersNil

`func (o *Endpoint) SetCustomHeadersNil(b bool)`

 SetCustomHeadersNil sets the value for CustomHeaders to be an explicit nil

### UnsetCustomHeaders
`func (o *Endpoint) UnsetCustomHeaders()`

UnsetCustomHeaders ensures that no value is present for CustomHeaders, not even an explicit nil
### GetRoutingStrategy

`func (o *Endpoint) GetRoutingStrategy() string`

GetRoutingStrategy returns the RoutingStrategy field if non-nil, zero value otherwise.

### GetRoutingStrategyOk

`func (o *Endpoint) GetRoutingStrategyOk() (*string, bool)`

GetRoutingStrategyOk returns a tuple with the RoutingStrategy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoutingStrategy

`func (o *Endpoint) SetRoutingStrategy(v string)`

SetRoutingStrategy sets RoutingStrategy field to given value.


### GetFallbackUrl

`func (o *Endpoint) GetFallbackUrl() string`

GetFallbackUrl returns the FallbackUrl field if non-nil, zero value otherwise.

### GetFallbackUrlOk

`func (o *Endpoint) GetFallbackUrlOk() (*string, bool)`

GetFallbackUrlOk returns a tuple with the FallbackUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFallbackUrl

`func (o *Endpoint) SetFallbackUrl(v string)`

SetFallbackUrl sets FallbackUrl field to given value.

### HasFallbackUrl

`func (o *Endpoint) HasFallbackUrl() bool`

HasFallbackUrl returns a boolean if a field has been set.

### SetFallbackUrlNil

`func (o *Endpoint) SetFallbackUrlNil(b bool)`

 SetFallbackUrlNil sets the value for FallbackUrl to be an explicit nil

### UnsetFallbackUrl
`func (o *Endpoint) UnsetFallbackUrl()`

UnsetFallbackUrl ensures that no value is present for FallbackUrl, not even an explicit nil
### GetAvgResponseMs

`func (o *Endpoint) GetAvgResponseMs() int32`

GetAvgResponseMs returns the AvgResponseMs field if non-nil, zero value otherwise.

### GetAvgResponseMsOk

`func (o *Endpoint) GetAvgResponseMsOk() (*int32, bool)`

GetAvgResponseMsOk returns a tuple with the AvgResponseMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAvgResponseMs

`func (o *Endpoint) SetAvgResponseMs(v int32)`

SetAvgResponseMs sets AvgResponseMs field to given value.


### GetFailureStreak

`func (o *Endpoint) GetFailureStreak() int32`

GetFailureStreak returns the FailureStreak field if non-nil, zero value otherwise.

### GetFailureStreakOk

`func (o *Endpoint) GetFailureStreakOk() (*int32, bool)`

GetFailureStreakOk returns a tuple with the FailureStreak field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFailureStreak

`func (o *Endpoint) SetFailureStreak(v int32)`

SetFailureStreak sets FailureStreak field to given value.


### GetFormat

`func (o *Endpoint) GetFormat() string`

GetFormat returns the Format field if non-nil, zero value otherwise.

### GetFormatOk

`func (o *Endpoint) GetFormatOk() (*string, bool)`

GetFormatOk returns a tuple with the Format field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFormat

`func (o *Endpoint) SetFormat(v string)`

SetFormat sets Format field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


