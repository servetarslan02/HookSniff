# AlertRule

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**Name** | Pointer to **string** |  | [optional] 
**Condition** | Pointer to **string** |  | [optional] 
**Threshold** | Pointer to **int32** |  | [optional] 
**Channels** | Pointer to **[]string** |  | [optional] 
**IsActive** | Pointer to **bool** |  | [optional] 
**CreatedAt** | Pointer to **string** |  | [optional] 

## Methods

### NewAlertRule

`func NewAlertRule() *AlertRule`

NewAlertRule instantiates a new AlertRule object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAlertRuleWithDefaults

`func NewAlertRuleWithDefaults() *AlertRule`

NewAlertRuleWithDefaults instantiates a new AlertRule object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *AlertRule) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *AlertRule) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *AlertRule) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *AlertRule) HasId() bool`

HasId returns a boolean if a field has been set.

### GetName

`func (o *AlertRule) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *AlertRule) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *AlertRule) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *AlertRule) HasName() bool`

HasName returns a boolean if a field has been set.

### GetCondition

`func (o *AlertRule) GetCondition() string`

GetCondition returns the Condition field if non-nil, zero value otherwise.

### GetConditionOk

`func (o *AlertRule) GetConditionOk() (*string, bool)`

GetConditionOk returns a tuple with the Condition field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCondition

`func (o *AlertRule) SetCondition(v string)`

SetCondition sets Condition field to given value.

### HasCondition

`func (o *AlertRule) HasCondition() bool`

HasCondition returns a boolean if a field has been set.

### GetThreshold

`func (o *AlertRule) GetThreshold() int32`

GetThreshold returns the Threshold field if non-nil, zero value otherwise.

### GetThresholdOk

`func (o *AlertRule) GetThresholdOk() (*int32, bool)`

GetThresholdOk returns a tuple with the Threshold field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetThreshold

`func (o *AlertRule) SetThreshold(v int32)`

SetThreshold sets Threshold field to given value.

### HasThreshold

`func (o *AlertRule) HasThreshold() bool`

HasThreshold returns a boolean if a field has been set.

### GetChannels

`func (o *AlertRule) GetChannels() []string`

GetChannels returns the Channels field if non-nil, zero value otherwise.

### GetChannelsOk

`func (o *AlertRule) GetChannelsOk() (*[]string, bool)`

GetChannelsOk returns a tuple with the Channels field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChannels

`func (o *AlertRule) SetChannels(v []string)`

SetChannels sets Channels field to given value.

### HasChannels

`func (o *AlertRule) HasChannels() bool`

HasChannels returns a boolean if a field has been set.

### GetIsActive

`func (o *AlertRule) GetIsActive() bool`

GetIsActive returns the IsActive field if non-nil, zero value otherwise.

### GetIsActiveOk

`func (o *AlertRule) GetIsActiveOk() (*bool, bool)`

GetIsActiveOk returns a tuple with the IsActive field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsActive

`func (o *AlertRule) SetIsActive(v bool)`

SetIsActive sets IsActive field to given value.

### HasIsActive

`func (o *AlertRule) HasIsActive() bool`

HasIsActive returns a boolean if a field has been set.

### GetCreatedAt

`func (o *AlertRule) GetCreatedAt() string`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *AlertRule) GetCreatedAtOk() (*string, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *AlertRule) SetCreatedAt(v string)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *AlertRule) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


