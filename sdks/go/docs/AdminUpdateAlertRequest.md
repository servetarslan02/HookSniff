# AdminUpdateAlertRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | Pointer to **string** |  | [optional] 
**Condition** | Pointer to **string** |  | [optional] 
**Threshold** | Pointer to **int32** |  | [optional] 
**Channels** | Pointer to **[]string** |  | [optional] 
**IsActive** | Pointer to **bool** |  | [optional] 

## Methods

### NewAdminUpdateAlertRequest

`func NewAdminUpdateAlertRequest() *AdminUpdateAlertRequest`

NewAdminUpdateAlertRequest instantiates a new AdminUpdateAlertRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminUpdateAlertRequestWithDefaults

`func NewAdminUpdateAlertRequestWithDefaults() *AdminUpdateAlertRequest`

NewAdminUpdateAlertRequestWithDefaults instantiates a new AdminUpdateAlertRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *AdminUpdateAlertRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *AdminUpdateAlertRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *AdminUpdateAlertRequest) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *AdminUpdateAlertRequest) HasName() bool`

HasName returns a boolean if a field has been set.

### GetCondition

`func (o *AdminUpdateAlertRequest) GetCondition() string`

GetCondition returns the Condition field if non-nil, zero value otherwise.

### GetConditionOk

`func (o *AdminUpdateAlertRequest) GetConditionOk() (*string, bool)`

GetConditionOk returns a tuple with the Condition field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCondition

`func (o *AdminUpdateAlertRequest) SetCondition(v string)`

SetCondition sets Condition field to given value.

### HasCondition

`func (o *AdminUpdateAlertRequest) HasCondition() bool`

HasCondition returns a boolean if a field has been set.

### GetThreshold

`func (o *AdminUpdateAlertRequest) GetThreshold() int32`

GetThreshold returns the Threshold field if non-nil, zero value otherwise.

### GetThresholdOk

`func (o *AdminUpdateAlertRequest) GetThresholdOk() (*int32, bool)`

GetThresholdOk returns a tuple with the Threshold field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetThreshold

`func (o *AdminUpdateAlertRequest) SetThreshold(v int32)`

SetThreshold sets Threshold field to given value.

### HasThreshold

`func (o *AdminUpdateAlertRequest) HasThreshold() bool`

HasThreshold returns a boolean if a field has been set.

### GetChannels

`func (o *AdminUpdateAlertRequest) GetChannels() []string`

GetChannels returns the Channels field if non-nil, zero value otherwise.

### GetChannelsOk

`func (o *AdminUpdateAlertRequest) GetChannelsOk() (*[]string, bool)`

GetChannelsOk returns a tuple with the Channels field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChannels

`func (o *AdminUpdateAlertRequest) SetChannels(v []string)`

SetChannels sets Channels field to given value.

### HasChannels

`func (o *AdminUpdateAlertRequest) HasChannels() bool`

HasChannels returns a boolean if a field has been set.

### GetIsActive

`func (o *AdminUpdateAlertRequest) GetIsActive() bool`

GetIsActive returns the IsActive field if non-nil, zero value otherwise.

### GetIsActiveOk

`func (o *AdminUpdateAlertRequest) GetIsActiveOk() (*bool, bool)`

GetIsActiveOk returns a tuple with the IsActive field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsActive

`func (o *AdminUpdateAlertRequest) SetIsActive(v bool)`

SetIsActive sets IsActive field to given value.

### HasIsActive

`func (o *AdminUpdateAlertRequest) HasIsActive() bool`

HasIsActive returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


