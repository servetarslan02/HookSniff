# CreateRoutingRuleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**Conditions** | **map[string]interface{}** | Conditions that trigger this rule (e.g. event_type, header match) | 
**Transform** | Pointer to **map[string]interface{}** | Optional payload transformation config | [optional] 
**TargetEndpointId** | **string** |  | 

## Methods

### NewCreateRoutingRuleRequest

`func NewCreateRoutingRuleRequest(name string, conditions map[string]interface{}, targetEndpointId string, ) *CreateRoutingRuleRequest`

NewCreateRoutingRuleRequest instantiates a new CreateRoutingRuleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateRoutingRuleRequestWithDefaults

`func NewCreateRoutingRuleRequestWithDefaults() *CreateRoutingRuleRequest`

NewCreateRoutingRuleRequestWithDefaults instantiates a new CreateRoutingRuleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *CreateRoutingRuleRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CreateRoutingRuleRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CreateRoutingRuleRequest) SetName(v string)`

SetName sets Name field to given value.


### GetConditions

`func (o *CreateRoutingRuleRequest) GetConditions() map[string]interface{}`

GetConditions returns the Conditions field if non-nil, zero value otherwise.

### GetConditionsOk

`func (o *CreateRoutingRuleRequest) GetConditionsOk() (*map[string]interface{}, bool)`

GetConditionsOk returns a tuple with the Conditions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConditions

`func (o *CreateRoutingRuleRequest) SetConditions(v map[string]interface{})`

SetConditions sets Conditions field to given value.


### GetTransform

`func (o *CreateRoutingRuleRequest) GetTransform() map[string]interface{}`

GetTransform returns the Transform field if non-nil, zero value otherwise.

### GetTransformOk

`func (o *CreateRoutingRuleRequest) GetTransformOk() (*map[string]interface{}, bool)`

GetTransformOk returns a tuple with the Transform field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTransform

`func (o *CreateRoutingRuleRequest) SetTransform(v map[string]interface{})`

SetTransform sets Transform field to given value.

### HasTransform

`func (o *CreateRoutingRuleRequest) HasTransform() bool`

HasTransform returns a boolean if a field has been set.

### SetTransformNil

`func (o *CreateRoutingRuleRequest) SetTransformNil(b bool)`

 SetTransformNil sets the value for Transform to be an explicit nil

### UnsetTransform
`func (o *CreateRoutingRuleRequest) UnsetTransform()`

UnsetTransform ensures that no value is present for Transform, not even an explicit nil
### GetTargetEndpointId

`func (o *CreateRoutingRuleRequest) GetTargetEndpointId() string`

GetTargetEndpointId returns the TargetEndpointId field if non-nil, zero value otherwise.

### GetTargetEndpointIdOk

`func (o *CreateRoutingRuleRequest) GetTargetEndpointIdOk() (*string, bool)`

GetTargetEndpointIdOk returns a tuple with the TargetEndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTargetEndpointId

`func (o *CreateRoutingRuleRequest) SetTargetEndpointId(v string)`

SetTargetEndpointId sets TargetEndpointId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


