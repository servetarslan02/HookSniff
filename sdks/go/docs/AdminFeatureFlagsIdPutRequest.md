# AdminFeatureFlagsIdPutRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | Pointer to **string** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 
**IsEnabled** | Pointer to **bool** |  | [optional] 
**RolloutPercentage** | Pointer to **int32** |  | [optional] 
**EnabledForPlans** | Pointer to **[]string** |  | [optional] 

## Methods

### NewAdminFeatureFlagsIdPutRequest

`func NewAdminFeatureFlagsIdPutRequest() *AdminFeatureFlagsIdPutRequest`

NewAdminFeatureFlagsIdPutRequest instantiates a new AdminFeatureFlagsIdPutRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminFeatureFlagsIdPutRequestWithDefaults

`func NewAdminFeatureFlagsIdPutRequestWithDefaults() *AdminFeatureFlagsIdPutRequest`

NewAdminFeatureFlagsIdPutRequestWithDefaults instantiates a new AdminFeatureFlagsIdPutRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *AdminFeatureFlagsIdPutRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *AdminFeatureFlagsIdPutRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *AdminFeatureFlagsIdPutRequest) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *AdminFeatureFlagsIdPutRequest) HasName() bool`

HasName returns a boolean if a field has been set.

### GetDescription

`func (o *AdminFeatureFlagsIdPutRequest) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *AdminFeatureFlagsIdPutRequest) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *AdminFeatureFlagsIdPutRequest) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *AdminFeatureFlagsIdPutRequest) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetIsEnabled

`func (o *AdminFeatureFlagsIdPutRequest) GetIsEnabled() bool`

GetIsEnabled returns the IsEnabled field if non-nil, zero value otherwise.

### GetIsEnabledOk

`func (o *AdminFeatureFlagsIdPutRequest) GetIsEnabledOk() (*bool, bool)`

GetIsEnabledOk returns a tuple with the IsEnabled field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsEnabled

`func (o *AdminFeatureFlagsIdPutRequest) SetIsEnabled(v bool)`

SetIsEnabled sets IsEnabled field to given value.

### HasIsEnabled

`func (o *AdminFeatureFlagsIdPutRequest) HasIsEnabled() bool`

HasIsEnabled returns a boolean if a field has been set.

### GetRolloutPercentage

`func (o *AdminFeatureFlagsIdPutRequest) GetRolloutPercentage() int32`

GetRolloutPercentage returns the RolloutPercentage field if non-nil, zero value otherwise.

### GetRolloutPercentageOk

`func (o *AdminFeatureFlagsIdPutRequest) GetRolloutPercentageOk() (*int32, bool)`

GetRolloutPercentageOk returns a tuple with the RolloutPercentage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRolloutPercentage

`func (o *AdminFeatureFlagsIdPutRequest) SetRolloutPercentage(v int32)`

SetRolloutPercentage sets RolloutPercentage field to given value.

### HasRolloutPercentage

`func (o *AdminFeatureFlagsIdPutRequest) HasRolloutPercentage() bool`

HasRolloutPercentage returns a boolean if a field has been set.

### GetEnabledForPlans

`func (o *AdminFeatureFlagsIdPutRequest) GetEnabledForPlans() []string`

GetEnabledForPlans returns the EnabledForPlans field if non-nil, zero value otherwise.

### GetEnabledForPlansOk

`func (o *AdminFeatureFlagsIdPutRequest) GetEnabledForPlansOk() (*[]string, bool)`

GetEnabledForPlansOk returns a tuple with the EnabledForPlans field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnabledForPlans

`func (o *AdminFeatureFlagsIdPutRequest) SetEnabledForPlans(v []string)`

SetEnabledForPlans sets EnabledForPlans field to given value.

### HasEnabledForPlans

`func (o *AdminFeatureFlagsIdPutRequest) HasEnabledForPlans() bool`

HasEnabledForPlans returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


