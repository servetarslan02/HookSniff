# AdminSystemStatus

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Version** | **string** |  | 
**UptimeSeconds** | **int32** |  | 
**DbStatus** | **string** |  | 
**RedisStatus** | **string** |  | 
**QueueDepth** | **int32** | Number of pending jobs in the delivery queue | 

## Methods

### NewAdminSystemStatus

`func NewAdminSystemStatus(version string, uptimeSeconds int32, dbStatus string, redisStatus string, queueDepth int32, ) *AdminSystemStatus`

NewAdminSystemStatus instantiates a new AdminSystemStatus object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminSystemStatusWithDefaults

`func NewAdminSystemStatusWithDefaults() *AdminSystemStatus`

NewAdminSystemStatusWithDefaults instantiates a new AdminSystemStatus object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetVersion

`func (o *AdminSystemStatus) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *AdminSystemStatus) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *AdminSystemStatus) SetVersion(v string)`

SetVersion sets Version field to given value.


### GetUptimeSeconds

`func (o *AdminSystemStatus) GetUptimeSeconds() int32`

GetUptimeSeconds returns the UptimeSeconds field if non-nil, zero value otherwise.

### GetUptimeSecondsOk

`func (o *AdminSystemStatus) GetUptimeSecondsOk() (*int32, bool)`

GetUptimeSecondsOk returns a tuple with the UptimeSeconds field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUptimeSeconds

`func (o *AdminSystemStatus) SetUptimeSeconds(v int32)`

SetUptimeSeconds sets UptimeSeconds field to given value.


### GetDbStatus

`func (o *AdminSystemStatus) GetDbStatus() string`

GetDbStatus returns the DbStatus field if non-nil, zero value otherwise.

### GetDbStatusOk

`func (o *AdminSystemStatus) GetDbStatusOk() (*string, bool)`

GetDbStatusOk returns a tuple with the DbStatus field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDbStatus

`func (o *AdminSystemStatus) SetDbStatus(v string)`

SetDbStatus sets DbStatus field to given value.


### GetRedisStatus

`func (o *AdminSystemStatus) GetRedisStatus() string`

GetRedisStatus returns the RedisStatus field if non-nil, zero value otherwise.

### GetRedisStatusOk

`func (o *AdminSystemStatus) GetRedisStatusOk() (*string, bool)`

GetRedisStatusOk returns a tuple with the RedisStatus field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRedisStatus

`func (o *AdminSystemStatus) SetRedisStatus(v string)`

SetRedisStatus sets RedisStatus field to given value.


### GetQueueDepth

`func (o *AdminSystemStatus) GetQueueDepth() int32`

GetQueueDepth returns the QueueDepth field if non-nil, zero value otherwise.

### GetQueueDepthOk

`func (o *AdminSystemStatus) GetQueueDepthOk() (*int32, bool)`

GetQueueDepthOk returns a tuple with the QueueDepth field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQueueDepth

`func (o *AdminSystemStatus) SetQueueDepth(v int32)`

SetQueueDepth sets QueueDepth field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


