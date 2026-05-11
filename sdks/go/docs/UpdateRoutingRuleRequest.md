# UpdateRoutingRuleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**Conditions** | Pointer to **map[string]interface{}** |  | [optional] 
**Transform** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewUpdateRoutingRuleRequest

`func NewUpdateRoutingRuleRequest(name string, ) *UpdateRoutingRuleRequest`

NewUpdateRoutingRuleRequest instantiates a new UpdateRoutingRuleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateRoutingRuleRequestWithDefaults

`func NewUpdateRoutingRuleRequestWithDefaults() *UpdateRoutingRuleRequest`

NewUpdateRoutingRuleRequestWithDefaults instantiates a new UpdateRoutingRuleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *UpdateRoutingRuleRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *UpdateRoutingRuleRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *UpdateRoutingRuleRequest) SetName(v string)`

SetName sets Name field to given value.


### GetConditions

`func (o *UpdateRoutingRuleRequest) GetConditions() map[string]interface{}`

GetConditions returns the Conditions field if non-nil, zero value otherwise.

### GetConditionsOk

`func (o *UpdateRoutingRuleRequest) GetConditionsOk() (*map[string]interface{}, bool)`

GetConditionsOk returns a tuple with the Conditions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConditions

`func (o *UpdateRoutingRuleRequest) SetConditions(v map[string]interface{})`

SetConditions sets Conditions field to given value.

### HasConditions

`func (o *UpdateRoutingRuleRequest) HasConditions() bool`

HasConditions returns a boolean if a field has been set.

### GetTransform

`func (o *UpdateRoutingRuleRequest) GetTransform() map[string]interface{}`

GetTransform returns the Transform field if non-nil, zero value otherwise.

### GetTransformOk

`func (o *UpdateRoutingRuleRequest) GetTransformOk() (*map[string]interface{}, bool)`

GetTransformOk returns a tuple with the Transform field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTransform

`func (o *UpdateRoutingRuleRequest) SetTransform(v map[string]interface{})`

SetTransform sets Transform field to given value.

### HasTransform

`func (o *UpdateRoutingRuleRequest) HasTransform() bool`

HasTransform returns a boolean if a field has been set.

### SetTransformNil

`func (o *UpdateRoutingRuleRequest) SetTransformNil(b bool)`

 SetTransformNil sets the value for Transform to be an explicit nil

### UnsetTransform
`func (o *UpdateRoutingRuleRequest) UnsetTransform()`

UnsetTransform ensures that no value is present for Transform, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


