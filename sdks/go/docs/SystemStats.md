# SystemStats

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**TotalUsers** | Pointer to **int32** |  | [optional] 
**ActiveUsers** | Pointer to **int32** |  | [optional] 
**TotalEndpoints** | Pointer to **int32** |  | [optional] 
**TotalDeliveries** | Pointer to **int32** |  | [optional] 
**PlanBreakdown** | Pointer to [**[]SystemStatsPlanBreakdownInner**](SystemStatsPlanBreakdownInner.md) |  | [optional] 

## Methods

### NewSystemStats

`func NewSystemStats() *SystemStats`

NewSystemStats instantiates a new SystemStats object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSystemStatsWithDefaults

`func NewSystemStatsWithDefaults() *SystemStats`

NewSystemStatsWithDefaults instantiates a new SystemStats object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTotalUsers

`func (o *SystemStats) GetTotalUsers() int32`

GetTotalUsers returns the TotalUsers field if non-nil, zero value otherwise.

### GetTotalUsersOk

`func (o *SystemStats) GetTotalUsersOk() (*int32, bool)`

GetTotalUsersOk returns a tuple with the TotalUsers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalUsers

`func (o *SystemStats) SetTotalUsers(v int32)`

SetTotalUsers sets TotalUsers field to given value.

### HasTotalUsers

`func (o *SystemStats) HasTotalUsers() bool`

HasTotalUsers returns a boolean if a field has been set.

### GetActiveUsers

`func (o *SystemStats) GetActiveUsers() int32`

GetActiveUsers returns the ActiveUsers field if non-nil, zero value otherwise.

### GetActiveUsersOk

`func (o *SystemStats) GetActiveUsersOk() (*int32, bool)`

GetActiveUsersOk returns a tuple with the ActiveUsers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetActiveUsers

`func (o *SystemStats) SetActiveUsers(v int32)`

SetActiveUsers sets ActiveUsers field to given value.

### HasActiveUsers

`func (o *SystemStats) HasActiveUsers() bool`

HasActiveUsers returns a boolean if a field has been set.

### GetTotalEndpoints

`func (o *SystemStats) GetTotalEndpoints() int32`

GetTotalEndpoints returns the TotalEndpoints field if non-nil, zero value otherwise.

### GetTotalEndpointsOk

`func (o *SystemStats) GetTotalEndpointsOk() (*int32, bool)`

GetTotalEndpointsOk returns a tuple with the TotalEndpoints field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalEndpoints

`func (o *SystemStats) SetTotalEndpoints(v int32)`

SetTotalEndpoints sets TotalEndpoints field to given value.

### HasTotalEndpoints

`func (o *SystemStats) HasTotalEndpoints() bool`

HasTotalEndpoints returns a boolean if a field has been set.

### GetTotalDeliveries

`func (o *SystemStats) GetTotalDeliveries() int32`

GetTotalDeliveries returns the TotalDeliveries field if non-nil, zero value otherwise.

### GetTotalDeliveriesOk

`func (o *SystemStats) GetTotalDeliveriesOk() (*int32, bool)`

GetTotalDeliveriesOk returns a tuple with the TotalDeliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalDeliveries

`func (o *SystemStats) SetTotalDeliveries(v int32)`

SetTotalDeliveries sets TotalDeliveries field to given value.

### HasTotalDeliveries

`func (o *SystemStats) HasTotalDeliveries() bool`

HasTotalDeliveries returns a boolean if a field has been set.

### GetPlanBreakdown

`func (o *SystemStats) GetPlanBreakdown() []SystemStatsPlanBreakdownInner`

GetPlanBreakdown returns the PlanBreakdown field if non-nil, zero value otherwise.

### GetPlanBreakdownOk

`func (o *SystemStats) GetPlanBreakdownOk() (*[]SystemStatsPlanBreakdownInner, bool)`

GetPlanBreakdownOk returns a tuple with the PlanBreakdown field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlanBreakdown

`func (o *SystemStats) SetPlanBreakdown(v []SystemStatsPlanBreakdownInner)`

SetPlanBreakdown sets PlanBreakdown field to given value.

### HasPlanBreakdown

`func (o *SystemStats) HasPlanBreakdown() bool`

HasPlanBreakdown returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


