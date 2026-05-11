# StreamParams

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | Pointer to **string** |  | [optional] 
**Status** | Pointer to **string** |  | [optional] 
**Limit** | Pointer to **int32** |  | [optional] [default to 50]

## Methods

### NewStreamParams

`func NewStreamParams() *StreamParams`

NewStreamParams instantiates a new StreamParams object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStreamParamsWithDefaults

`func NewStreamParamsWithDefaults() *StreamParams`

NewStreamParamsWithDefaults instantiates a new StreamParams object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *StreamParams) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *StreamParams) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *StreamParams) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.

### HasEndpointId

`func (o *StreamParams) HasEndpointId() bool`

HasEndpointId returns a boolean if a field has been set.

### GetStatus

`func (o *StreamParams) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *StreamParams) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *StreamParams) SetStatus(v string)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *StreamParams) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetLimit

`func (o *StreamParams) GetLimit() int32`

GetLimit returns the Limit field if non-nil, zero value otherwise.

### GetLimitOk

`func (o *StreamParams) GetLimitOk() (*int32, bool)`

GetLimitOk returns a tuple with the Limit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLimit

`func (o *StreamParams) SetLimit(v int32)`

SetLimit sets Limit field to given value.

### HasLimit

`func (o *StreamParams) HasLimit() bool`

HasLimit returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


