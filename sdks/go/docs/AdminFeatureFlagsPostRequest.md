# AdminFeatureFlagsPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**Description** | Pointer to **string** |  | [optional] 
**IsEnabled** | Pointer to **bool** |  | [optional] [default to false]
**RolloutPercentage** | Pointer to **int32** |  | [optional] [default to 100]
**EnabledForPlans** | Pointer to **[]string** |  | [optional] 

## Methods

### NewAdminFeatureFlagsPostRequest

`func NewAdminFeatureFlagsPostRequest(name string, ) *AdminFeatureFlagsPostRequest`

NewAdminFeatureFlagsPostRequest instantiates a new AdminFeatureFlagsPostRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminFeatureFlagsPostRequestWithDefaults

`func NewAdminFeatureFlagsPostRequestWithDefaults() *AdminFeatureFlagsPostRequest`

NewAdminFeatureFlagsPostRequestWithDefaults instantiates a new AdminFeatureFlagsPostRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *AdminFeatureFlagsPostRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *AdminFeatureFlagsPostRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *AdminFeatureFlagsPostRequest) SetName(v string)`

SetName sets Name field to given value.


### GetDescription

`func (o *AdminFeatureFlagsPostRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *AdminFeatureFlagsPostRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *AdminFeatureFlagsPostRequest) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *AdminFeatureFlagsPostRequest) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetIsEnabled

`func (o *AdminFeatureFlagsPostRequest) GetIsEnabled() bool`

GetIsEnabled returns the IsEnabled field if non-nil, zero value otherwise.

### GetIsEnabledOk

`func (o *AdminFeatureFlagsPostRequest) GetIsEnabledOk() (*bool, bool)`

GetIsEnabledOk returns a tuple with the IsEnabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsEnabled

`func (o *AdminFeatureFlagsPostRequest) SetIsEnabled(v bool)`

SetIsEnabled sets IsEnabled field to given value.

### HasIsEnabled

`func (o *AdminFeatureFlagsPostRequest) HasIsEnabled() bool`

HasIsEnabled returns a boolean if a field has been set.

### GetRolloutPercentage

`func (o *AdminFeatureFlagsPostRequest) GetRolloutPercentage() int32`

GetRolloutPercentage returns the RolloutPercentage field if non-nil, zero value otherwise.

### GetRolloutPercentageOk

`func (o *AdminFeatureFlagsPostRequest) GetRolloutPercentageOk() (*int32, bool)`

GetRolloutPercentageOk returns a tuple with the RolloutPercentage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRolloutPercentage

`func (o *AdminFeatureFlagsPostRequest) SetRolloutPercentage(v int32)`

SetRolloutPercentage sets RolloutPercentage field to given value.

### HasRolloutPercentage

`func (o *AdminFeatureFlagsPostRequest) HasRolloutPercentage() bool`

HasRolloutPercentage returns a boolean if a field has been set.

### GetEnabledForPlans

`func (o *AdminFeatureFlagsPostRequest) GetEnabledForPlans() []string`

GetEnabledForPlans returns the EnabledForPlans field if non-nil, zero value otherwise.

### GetEnabledForPlansOk

`func (o *AdminFeatureFlagsPostRequest) GetEnabledForPlansOk() (*[]string, bool)`

GetEnabledForPlansOk returns a tuple with the EnabledForPlans field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabledForPlans

`func (o *AdminFeatureFlagsPostRequest) SetEnabledForPlans(v []string)`

SetEnabledForPlans sets EnabledForPlans field to given value.

### HasEnabledForPlans

`func (o *AdminFeatureFlagsPostRequest) HasEnabledForPlans() bool`

HasEnabledForPlans returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


