# AdminUsersIdGet200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**User** | Pointer to [**UserSummary**](UserSummary.md) |  | [optional] 
**Endpoints** | Pointer to [**[]AdminUsersIdGet200ResponseEndpointsInner**](AdminUsersIdGet200ResponseEndpointsInner.md) |  | [optional] 
**RecentDeliveries** | Pointer to [**[]AdminUsersIdGet200ResponseRecentDeliveriesInner**](AdminUsersIdGet200ResponseRecentDeliveriesInner.md) |  | [optional] 
**UsageStats** | Pointer to [**AdminUsersIdGet200ResponseUsageStats**](AdminUsersIdGet200ResponseUsageStats.md) |  | [optional] 

## Methods

### NewAdminUsersIdGet200Response

`func NewAdminUsersIdGet200Response() *AdminUsersIdGet200Response`

NewAdminUsersIdGet200Response instantiates a new AdminUsersIdGet200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminUsersIdGet200ResponseWithDefaults

`func NewAdminUsersIdGet200ResponseWithDefaults() *AdminUsersIdGet200Response`

NewAdminUsersIdGet200ResponseWithDefaults instantiates a new AdminUsersIdGet200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUser

`func (o *AdminUsersIdGet200Response) GetUser() UserSummary`

GetUser returns the User field if non-nil, zero value otherwise.

### GetUserOk

`func (o *AdminUsersIdGet200Response) GetUserOk() (*UserSummary, bool)`

GetUserOk returns a tuple with the User field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUser

`func (o *AdminUsersIdGet200Response) SetUser(v UserSummary)`

SetUser sets User field to given value.

### HasUser

`func (o *AdminUsersIdGet200Response) HasUser() bool`

HasUser returns a boolean if a field has been set.

### GetEndpoints

`func (o *AdminUsersIdGet200Response) GetEndpoints() []AdminUsersIdGet200ResponseEndpointsInner`

GetEndpoints returns the Endpoints field if non-nil, zero value otherwise.

### GetEndpointsOk

`func (o *AdminUsersIdGet200Response) GetEndpointsOk() (*[]AdminUsersIdGet200ResponseEndpointsInner, bool)`

GetEndpointsOk returns a tuple with the Endpoints field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpoints

`func (o *AdminUsersIdGet200Response) SetEndpoints(v []AdminUsersIdGet200ResponseEndpointsInner)`

SetEndpoints sets Endpoints field to given value.

### HasEndpoints

`func (o *AdminUsersIdGet200Response) HasEndpoints() bool`

HasEndpoints returns a boolean if a field has been set.

### GetRecentDeliveries

`func (o *AdminUsersIdGet200Response) GetRecentDeliveries() []AdminUsersIdGet200ResponseRecentDeliveriesInner`

GetRecentDeliveries returns the RecentDeliveries field if non-nil, zero value otherwise.

### GetRecentDeliveriesOk

`func (o *AdminUsersIdGet200Response) GetRecentDeliveriesOk() (*[]AdminUsersIdGet200ResponseRecentDeliveriesInner, bool)`

GetRecentDeliveriesOk returns a tuple with the RecentDeliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRecentDeliveries

`func (o *AdminUsersIdGet200Response) SetRecentDeliveries(v []AdminUsersIdGet200ResponseRecentDeliveriesInner)`

SetRecentDeliveries sets RecentDeliveries field to given value.

### HasRecentDeliveries

`func (o *AdminUsersIdGet200Response) HasRecentDeliveries() bool`

HasRecentDeliveries returns a boolean if a field has been set.

### GetUsageStats

`func (o *AdminUsersIdGet200Response) GetUsageStats() AdminUsersIdGet200ResponseUsageStats`

GetUsageStats returns the UsageStats field if non-nil, zero value otherwise.

### GetUsageStatsOk

`func (o *AdminUsersIdGet200Response) GetUsageStatsOk() (*AdminUsersIdGet200ResponseUsageStats, bool)`

GetUsageStatsOk returns a tuple with the UsageStats field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsageStats

`func (o *AdminUsersIdGet200Response) SetUsageStats(v AdminUsersIdGet200ResponseUsageStats)`

SetUsageStats sets UsageStats field to given value.

### HasUsageStats

`func (o *AdminUsersIdGet200Response) HasUsageStats() bool`

HasUsageStats returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


