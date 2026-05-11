# CreateTransformRuleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**RuleType** | **string** |  | 
**Config** | **map[string]interface{}** |  | 

## Methods

### NewCreateTransformRuleRequest

`func NewCreateTransformRuleRequest(name string, ruleType string, config map[string]interface{}, ) *CreateTransformRuleRequest`

NewCreateTransformRuleRequest instantiates a new CreateTransformRuleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateTransformRuleRequestWithDefaults

`func NewCreateTransformRuleRequestWithDefaults() *CreateTransformRuleRequest`

NewCreateTransformRuleRequestWithDefaults instantiates a new CreateTransformRuleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *CreateTransformRuleRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CreateTransformRuleRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CreateTransformRuleRequest) SetName(v string)`

SetName sets Name field to given value.


### GetRuleType

`func (o *CreateTransformRuleRequest) GetRuleType() string`

GetRuleType returns the RuleType field if non-nil, zero value otherwise.

### GetRuleTypeOk

`func (o *CreateTransformRuleRequest) GetRuleTypeOk() (*string, bool)`

GetRuleTypeOk returns a tuple with the RuleType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRuleType

`func (o *CreateTransformRuleRequest) SetRuleType(v string)`

SetRuleType sets RuleType field to given value.


### GetConfig

`func (o *CreateTransformRuleRequest) GetConfig() map[string]interface{}`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *CreateTransformRuleRequest) GetConfigOk() (*map[string]interface{}, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *CreateTransformRuleRequest) SetConfig(v map[string]interface{})`

SetConfig sets Config field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


