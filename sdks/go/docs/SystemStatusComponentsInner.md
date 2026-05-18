# SystemStatusComponentsInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | Pointer to **string** |  | [optional] 
**Status** | Pointer to **string** |  | [optional] 
**LatencyMs** | Pointer to **NullableInt32** |  | [optional] 
**Description** | Pointer to **string** |  | [optional] 
**LastChecked** | Pointer to **string** |  | [optional] 

## Methods

### NewSystemStatusComponentsInner

`func NewSystemStatusComponentsInner() *SystemStatusComponentsInner`

NewSystemStatusComponentsInner instantiates a new SystemStatusComponentsInner object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSystemStatusComponentsInnerWithDefaults

`func NewSystemStatusComponentsInnerWithDefaults() *SystemStatusComponentsInner`

NewSystemStatusComponentsInnerWithDefaults instantiates a new SystemStatusComponentsInner object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *SystemStatusComponentsInner) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *SystemStatusComponentsInner) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *SystemStatusComponentsInner) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *SystemStatusComponentsInner) HasName() bool`

HasName returns a boolean if a field has been set.

### GetStatus

`func (o *SystemStatusComponentsInner) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *SystemStatusComponentsInner) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *SystemStatusComponentsInner) SetStatus(v string)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *SystemStatusComponentsInner) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetLatencyMs

`func (o *SystemStatusComponentsInner) GetLatencyMs() int32`

GetLatencyMs returns the LatencyMs field if non-nil, zero value otherwise.

### GetLatencyMsOk

`func (o *SystemStatusComponentsInner) GetLatencyMsOk() (*int32, bool)`

GetLatencyMsOk returns a tuple with the LatencyMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLatencyMs

`func (o *SystemStatusComponentsInner) SetLatencyMs(v int32)`

SetLatencyMs sets LatencyMs field to given value.

### HasLatencyMs

`func (o *SystemStatusComponentsInner) HasLatencyMs() bool`

HasLatencyMs returns a boolean if a field has been set.

### SetLatencyMsNil

`func (o *SystemStatusComponentsInner) SetLatencyMsNil(b bool)`

 SetLatencyMsNil sets the value for LatencyMs to be an explicit nil

### UnsetLatencyMs
`func (o *SystemStatusComponentsInner) UnsetLatencyMs()`

UnsetLatencyMs ensures that no value is present for LatencyMs, not even an explicit nil
### GetDescription

`func (o *SystemStatusComponentsInner) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *SystemStatusComponentsInner) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *SystemStatusComponentsInner) SetDescription(v string)`

SetDescription sets Description field to given value.

### HasDescription

`func (o *SystemStatusComponentsInner) HasDescription() bool`

HasDescription returns a boolean if a field has been set.

### GetLastChecked

`func (o *SystemStatusComponentsInner) GetLastChecked() string`

GetLastChecked returns the LastChecked field if non-nil, zero value otherwise.

### GetLastCheckedOk

`func (o *SystemStatusComponentsInner) GetLastCheckedOk() (*string, bool)`

GetLastCheckedOk returns a tuple with the LastChecked field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLastChecked

`func (o *SystemStatusComponentsInner) SetLastChecked(v string)`

SetLastChecked sets LastChecked field to given value.

### HasLastChecked

`func (o *SystemStatusComponentsInner) HasLastChecked() bool`

HasLastChecked returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


