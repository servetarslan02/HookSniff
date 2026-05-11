# SystemStatus

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**OverallStatus** | **string** |  | 
**Uptime30d** | **float32** |  | 
**Components** | [**[]SystemStatusComponentsInner**](SystemStatusComponentsInner.md) |  | 
**CheckedAt** | **string** |  | 

## Methods

### NewSystemStatus

`func NewSystemStatus(overallStatus string, uptime30d float32, components []SystemStatusComponentsInner, checkedAt string, ) *SystemStatus`

NewSystemStatus instantiates a new SystemStatus object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSystemStatusWithDefaults

`func NewSystemStatusWithDefaults() *SystemStatus`

NewSystemStatusWithDefaults instantiates a new SystemStatus object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetOverallStatus

`func (o *SystemStatus) GetOverallStatus() string`

GetOverallStatus returns the OverallStatus field if non-nil, zero value otherwise.

### GetOverallStatusOk

`func (o *SystemStatus) GetOverallStatusOk() (*string, bool)`

GetOverallStatusOk returns a tuple with the OverallStatus field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOverallStatus

`func (o *SystemStatus) SetOverallStatus(v string)`

SetOverallStatus sets OverallStatus field to given value.


### GetUptime30d

`func (o *SystemStatus) GetUptime30d() float32`

GetUptime30d returns the Uptime30d field if non-nil, zero value otherwise.

### GetUptime30dOk

`func (o *SystemStatus) GetUptime30dOk() (*float32, bool)`

GetUptime30dOk returns a tuple with the Uptime30d field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUptime30d

`func (o *SystemStatus) SetUptime30d(v float32)`

SetUptime30d sets Uptime30d field to given value.


### GetComponents

`func (o *SystemStatus) GetComponents() []SystemStatusComponentsInner`

GetComponents returns the Components field if non-nil, zero value otherwise.

### GetComponentsOk

`func (o *SystemStatus) GetComponentsOk() (*[]SystemStatusComponentsInner, bool)`

GetComponentsOk returns a tuple with the Components field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetComponents

`func (o *SystemStatus) SetComponents(v []SystemStatusComponentsInner)`

SetComponents sets Components field to given value.


### GetCheckedAt

`func (o *SystemStatus) GetCheckedAt() string`

GetCheckedAt returns the CheckedAt field if non-nil, zero value otherwise.

### GetCheckedAtOk

`func (o *SystemStatus) GetCheckedAtOk() (*string, bool)`

GetCheckedAtOk returns a tuple with the CheckedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCheckedAt

`func (o *SystemStatus) SetCheckedAt(v string)`

SetCheckedAt sets CheckedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


