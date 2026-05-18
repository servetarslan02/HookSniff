# CreateAlertRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**Condition** | **string** |  | 
**Threshold** | **int32** |  | 
**Channels** | **[]string** |  | 
**EndpointId** | Pointer to **string** |  | [optional] 

## Methods

### NewCreateAlertRequest

`func NewCreateAlertRequest(name string, condition string, threshold int32, channels []string, ) *CreateAlertRequest`

NewCreateAlertRequest instantiates a new CreateAlertRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAlertRequestWithDefaults

`func NewCreateAlertRequestWithDefaults() *CreateAlertRequest`

NewCreateAlertRequestWithDefaults instantiates a new CreateAlertRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *CreateAlertRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CreateAlertRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CreateAlertRequest) SetName(v string)`

SetName sets Name field to given value.


### GetCondition

`func (o *CreateAlertRequest) GetCondition() string`

GetCondition returns the Condition field if non-nil, zero value otherwise.

### GetConditionOk

`func (o *CreateAlertRequest) GetConditionOk() (*string, bool)`

GetConditionOk returns a tuple with the Condition field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCondition

`func (o *CreateAlertRequest) SetCondition(v string)`

SetCondition sets Condition field to given value.


### GetThreshold

`func (o *CreateAlertRequest) GetThreshold() int32`

GetThreshold returns the Threshold field if non-nil, zero value otherwise.

### GetThresholdOk

`func (o *CreateAlertRequest) GetThresholdOk() (*int32, bool)`

GetThresholdOk returns a tuple with the Threshold field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetThreshold

`func (o *CreateAlertRequest) SetThreshold(v int32)`

SetThreshold sets Threshold field to given value.


### GetChannels

`func (o *CreateAlertRequest) GetChannels() []string`

GetChannels returns the Channels field if non-nil, zero value otherwise.

### GetChannelsOk

`func (o *CreateAlertRequest) GetChannelsOk() (*[]string, bool)`

GetChannelsOk returns a tuple with the Channels field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChannels

`func (o *CreateAlertRequest) SetChannels(v []string)`

SetChannels sets Channels field to given value.


### GetEndpointId

`func (o *CreateAlertRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *CreateAlertRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *CreateAlertRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.

### HasEndpointId

`func (o *CreateAlertRequest) HasEndpointId() bool`

HasEndpointId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


