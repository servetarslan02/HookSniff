# UpdateAlertRuleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**Condition** | **string** |  | 
**Threshold** | **int32** |  | 
**Channels** | **[]string** |  | 

## Methods

### NewUpdateAlertRuleRequest

`func NewUpdateAlertRuleRequest(name string, condition string, threshold int32, channels []string, ) *UpdateAlertRuleRequest`

NewUpdateAlertRuleRequest instantiates a new UpdateAlertRuleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateAlertRuleRequestWithDefaults

`func NewUpdateAlertRuleRequestWithDefaults() *UpdateAlertRuleRequest`

NewUpdateAlertRuleRequestWithDefaults instantiates a new UpdateAlertRuleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *UpdateAlertRuleRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *UpdateAlertRuleRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *UpdateAlertRuleRequest) SetName(v string)`

SetName sets Name field to given value.


### GetCondition

`func (o *UpdateAlertRuleRequest) GetCondition() string`

GetCondition returns the Condition field if non-nil, zero value otherwise.

### GetConditionOk

`func (o *UpdateAlertRuleRequest) GetConditionOk() (*string, bool)`

GetConditionOk returns a tuple with the Condition field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCondition

`func (o *UpdateAlertRuleRequest) SetCondition(v string)`

SetCondition sets Condition field to given value.


### GetThreshold

`func (o *UpdateAlertRuleRequest) GetThreshold() int32`

GetThreshold returns the Threshold field if non-nil, zero value otherwise.

### GetThresholdOk

`func (o *UpdateAlertRuleRequest) GetThresholdOk() (*int32, bool)`

GetThresholdOk returns a tuple with the Threshold field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetThreshold

`func (o *UpdateAlertRuleRequest) SetThreshold(v int32)`

SetThreshold sets Threshold field to given value.


### GetChannels

`func (o *UpdateAlertRuleRequest) GetChannels() []string`

GetChannels returns the Channels field if non-nil, zero value otherwise.

### GetChannelsOk

`func (o *UpdateAlertRuleRequest) GetChannelsOk() (*[]string, bool)`

GetChannelsOk returns a tuple with the Channels field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChannels

`func (o *UpdateAlertRuleRequest) SetChannels(v []string)`

SetChannels sets Channels field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


