# UpdateRoutingRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**RoutingStrategy** | **string** |  | 
**FallbackUrl** | **string** |  | 

## Methods

### NewUpdateRoutingRequest

`func NewUpdateRoutingRequest(routingStrategy string, fallbackUrl string, ) *UpdateRoutingRequest`

NewUpdateRoutingRequest instantiates a new UpdateRoutingRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateRoutingRequestWithDefaults

`func NewUpdateRoutingRequestWithDefaults() *UpdateRoutingRequest`

NewUpdateRoutingRequestWithDefaults instantiates a new UpdateRoutingRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRoutingStrategy

`func (o *UpdateRoutingRequest) GetRoutingStrategy() string`

GetRoutingStrategy returns the RoutingStrategy field if non-nil, zero value otherwise.

### GetRoutingStrategyOk

`func (o *UpdateRoutingRequest) GetRoutingStrategyOk() (*string, bool)`

GetRoutingStrategyOk returns a tuple with the RoutingStrategy field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRoutingStrategy

`func (o *UpdateRoutingRequest) SetRoutingStrategy(v string)`

SetRoutingStrategy sets RoutingStrategy field to given value.


### GetFallbackUrl

`func (o *UpdateRoutingRequest) GetFallbackUrl() string`

GetFallbackUrl returns the FallbackUrl field if non-nil, zero value otherwise.

### GetFallbackUrlOk

`func (o *UpdateRoutingRequest) GetFallbackUrlOk() (*string, bool)`

GetFallbackUrlOk returns a tuple with the FallbackUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFallbackUrl

`func (o *UpdateRoutingRequest) SetFallbackUrl(v string)`

SetFallbackUrl sets FallbackUrl field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


