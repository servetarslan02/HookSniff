# CreateAlertRuleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** | Human-readable alert name | 
**Condition** | **string** | Condition that triggers the alert | 
**Threshold** | **int32** | Threshold value for the condition | 
**Channels** | **[]string** | Notification channels to alert on | 

## Methods

### NewCreateAlertRuleRequest

`func NewCreateAlertRuleRequest(name string, condition string, threshold int32, channels []string, ) *CreateAlertRuleRequest`

NewCreateAlertRuleRequest instantiates a new CreateAlertRuleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateAlertRuleRequestWithDefaults

`func NewCreateAlertRuleRequestWithDefaults() *CreateAlertRuleRequest`

NewCreateAlertRuleRequestWithDefaults instantiates a new CreateAlertRuleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *CreateAlertRuleRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CreateAlertRuleRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CreateAlertRuleRequest) SetName(v string)`

SetName sets Name field to given value.


### GetCondition

`func (o *CreateAlertRuleRequest) GetCondition() string`

GetCondition returns the Condition field if non-nil, zero value otherwise.

### GetConditionOk

`func (o *CreateAlertRuleRequest) GetConditionOk() (*string, bool)`

GetConditionOk returns a tuple with the Condition field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCondition

`func (o *CreateAlertRuleRequest) SetCondition(v string)`

SetCondition sets Condition field to given value.


### GetThreshold

`func (o *CreateAlertRuleRequest) GetThreshold() int32`

GetThreshold returns the Threshold field if non-nil, zero value otherwise.

### GetThresholdOk

`func (o *CreateAlertRuleRequest) GetThresholdOk() (*int32, bool)`

GetThresholdOk returns a tuple with the Threshold field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetThreshold

`func (o *CreateAlertRuleRequest) SetThreshold(v int32)`

SetThreshold sets Threshold field to given value.


### GetChannels

`func (o *CreateAlertRuleRequest) GetChannels() []string`

GetChannels returns the Channels field if non-nil, zero value otherwise.

### GetChannelsOk

`func (o *CreateAlertRuleRequest) GetChannelsOk() (*[]string, bool)`

GetChannelsOk returns a tuple with the Channels field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChannels

`func (o *CreateAlertRuleRequest) SetChannels(v []string)`

SetChannels sets Channels field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


