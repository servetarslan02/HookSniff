# UpdateTransformRuleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**Config** | Pointer to **map[string]interface{}** | Updated transformation configuration | [optional] 

## Methods

### NewUpdateTransformRuleRequest

`func NewUpdateTransformRuleRequest(name string, ) *UpdateTransformRuleRequest`

NewUpdateTransformRuleRequest instantiates a new UpdateTransformRuleRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateTransformRuleRequestWithDefaults

`func NewUpdateTransformRuleRequestWithDefaults() *UpdateTransformRuleRequest`

NewUpdateTransformRuleRequestWithDefaults instantiates a new UpdateTransformRuleRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *UpdateTransformRuleRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *UpdateTransformRuleRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *UpdateTransformRuleRequest) SetName(v string)`

SetName sets Name field to given value.


### GetConfig

`func (o *UpdateTransformRuleRequest) GetConfig() map[string]interface{}`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *UpdateTransformRuleRequest) GetConfigOk() (*map[string]interface{}, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *UpdateTransformRuleRequest) SetConfig(v map[string]interface{})`

SetConfig sets Config field to given value.

### HasConfig

`func (o *UpdateTransformRuleRequest) HasConfig() bool`

HasConfig returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


