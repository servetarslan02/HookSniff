# UsageStatsResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointsCount** | **int32** | Number of active endpoints | 
**DeliveriesCount** | **int32** | Total deliveries in current period | 
**TeamsCount** | **int32** | Number of teams | 
**StorageUsedBytes** | **int32** | Storage used in bytes | 

## Methods

### NewUsageStatsResponse

`func NewUsageStatsResponse(endpointsCount int32, deliveriesCount int32, teamsCount int32, storageUsedBytes int32, ) *UsageStatsResponse`

NewUsageStatsResponse instantiates a new UsageStatsResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUsageStatsResponseWithDefaults

`func NewUsageStatsResponseWithDefaults() *UsageStatsResponse`

NewUsageStatsResponseWithDefaults instantiates a new UsageStatsResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointsCount

`func (o *UsageStatsResponse) GetEndpointsCount() int32`

GetEndpointsCount returns the EndpointsCount field if non-nil, zero value otherwise.

### GetEndpointsCountOk

`func (o *UsageStatsResponse) GetEndpointsCountOk() (*int32, bool)`

GetEndpointsCountOk returns a tuple with the EndpointsCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointsCount

`func (o *UsageStatsResponse) SetEndpointsCount(v int32)`

SetEndpointsCount sets EndpointsCount field to given value.


### GetDeliveriesCount

`func (o *UsageStatsResponse) GetDeliveriesCount() int32`

GetDeliveriesCount returns the DeliveriesCount field if non-nil, zero value otherwise.

### GetDeliveriesCountOk

`func (o *UsageStatsResponse) GetDeliveriesCountOk() (*int32, bool)`

GetDeliveriesCountOk returns a tuple with the DeliveriesCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDeliveriesCount

`func (o *UsageStatsResponse) SetDeliveriesCount(v int32)`

SetDeliveriesCount sets DeliveriesCount field to given value.


### GetTeamsCount

`func (o *UsageStatsResponse) GetTeamsCount() int32`

GetTeamsCount returns the TeamsCount field if non-nil, zero value otherwise.

### GetTeamsCountOk

`func (o *UsageStatsResponse) GetTeamsCountOk() (*int32, bool)`

GetTeamsCountOk returns a tuple with the TeamsCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTeamsCount

`func (o *UsageStatsResponse) SetTeamsCount(v int32)`

SetTeamsCount sets TeamsCount field to given value.


### GetStorageUsedBytes

`func (o *UsageStatsResponse) GetStorageUsedBytes() int32`

GetStorageUsedBytes returns the StorageUsedBytes field if non-nil, zero value otherwise.

### GetStorageUsedBytesOk

`func (o *UsageStatsResponse) GetStorageUsedBytesOk() (*int32, bool)`

GetStorageUsedBytesOk returns a tuple with the StorageUsedBytes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStorageUsedBytes

`func (o *UsageStatsResponse) SetStorageUsedBytes(v int32)`

SetStorageUsedBytes sets StorageUsedBytes field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


