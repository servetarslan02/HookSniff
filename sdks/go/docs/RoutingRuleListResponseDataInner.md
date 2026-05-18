# RoutingRuleListResponseDataInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Name** | **string** |  | 
**Conditions** | **map[string]interface{}** |  | 
**Transform** | Pointer to **map[string]interface{}** |  | [optional] 
**TargetEndpointId** | **string** |  | 
**Enabled** | Pointer to **bool** |  | [optional] 
**CreatedAt** | Pointer to **time.Time** |  | [optional] 

## Methods

### NewRoutingRuleListResponseDataInner

`func NewRoutingRuleListResponseDataInner(id string, name string, conditions map[string]interface{}, targetEndpointId string, ) *RoutingRuleListResponseDataInner`

NewRoutingRuleListResponseDataInner instantiates a new RoutingRuleListResponseDataInner object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRoutingRuleListResponseDataInnerWithDefaults

`func NewRoutingRuleListResponseDataInnerWithDefaults() *RoutingRuleListResponseDataInner`

NewRoutingRuleListResponseDataInnerWithDefaults instantiates a new RoutingRuleListResponseDataInner object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *RoutingRuleListResponseDataInner) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *RoutingRuleListResponseDataInner) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *RoutingRuleListResponseDataInner) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *RoutingRuleListResponseDataInner) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *RoutingRuleListResponseDataInner) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *RoutingRuleListResponseDataInner) SetName(v string)`

SetName sets Name field to given value.


### GetConditions

`func (o *RoutingRuleListResponseDataInner) GetConditions() map[string]interface{}`

GetConditions returns the Conditions field if non-nil, zero value otherwise.

### GetConditionsOk

`func (o *RoutingRuleListResponseDataInner) GetConditionsOk() (*map[string]interface{}, bool)`

GetConditionsOk returns a tuple with the Conditions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConditions

`func (o *RoutingRuleListResponseDataInner) SetConditions(v map[string]interface{})`

SetConditions sets Conditions field to given value.


### GetTransform

`func (o *RoutingRuleListResponseDataInner) GetTransform() map[string]interface{}`

GetTransform returns the Transform field if non-nil, zero value otherwise.

### GetTransformOk

`func (o *RoutingRuleListResponseDataInner) GetTransformOk() (*map[string]interface{}, bool)`

GetTransformOk returns a tuple with the Transform field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTransform

`func (o *RoutingRuleListResponseDataInner) SetTransform(v map[string]interface{})`

SetTransform sets Transform field to given value.

### HasTransform

`func (o *RoutingRuleListResponseDataInner) HasTransform() bool`

HasTransform returns a boolean if a field has been set.

### SetTransformNil

`func (o *RoutingRuleListResponseDataInner) SetTransformNil(b bool)`

 SetTransformNil sets the value for Transform to be an explicit nil

### UnsetTransform
`func (o *RoutingRuleListResponseDataInner) UnsetTransform()`

UnsetTransform ensures that no value is present for Transform, not even an explicit nil
### GetTargetEndpointId

`func (o *RoutingRuleListResponseDataInner) GetTargetEndpointId() string`

GetTargetEndpointId returns the TargetEndpointId field if non-nil, zero value otherwise.

### GetTargetEndpointIdOk

`func (o *RoutingRuleListResponseDataInner) GetTargetEndpointIdOk() (*string, bool)`

GetTargetEndpointIdOk returns a tuple with the TargetEndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTargetEndpointId

`func (o *RoutingRuleListResponseDataInner) SetTargetEndpointId(v string)`

SetTargetEndpointId sets TargetEndpointId field to given value.


### GetEnabled

`func (o *RoutingRuleListResponseDataInner) GetEnabled() bool`

GetEnabled returns the Enabled field if non-nil, zero value otherwise.

### GetEnabledOk

`func (o *RoutingRuleListResponseDataInner) GetEnabledOk() (*bool, bool)`

GetEnabledOk returns a tuple with the Enabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabled

`func (o *RoutingRuleListResponseDataInner) SetEnabled(v bool)`

SetEnabled sets Enabled field to given value.

### HasEnabled

`func (o *RoutingRuleListResponseDataInner) HasEnabled() bool`

HasEnabled returns a boolean if a field has been set.

### GetCreatedAt

`func (o *RoutingRuleListResponseDataInner) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *RoutingRuleListResponseDataInner) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *RoutingRuleListResponseDataInner) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *RoutingRuleListResponseDataInner) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


