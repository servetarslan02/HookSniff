# Delivery

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**EndpointId** | **string** |  | 
**Event** | Pointer to **NullableString** |  | [optional] 
**Status** | **string** |  | 
**AttemptCount** | **int32** |  | 
**ResponseStatus** | Pointer to **NullableInt32** |  | [optional] 
**ReplayCount** | **int32** |  | 
**CreatedAt** | **time.Time** |  | 

## Methods

### NewDelivery

`func NewDelivery(id string, endpointId string, status string, attemptCount int32, replayCount int32, createdAt time.Time, ) *Delivery`

NewDelivery instantiates a new Delivery object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeliveryWithDefaults

`func NewDeliveryWithDefaults() *Delivery`

NewDeliveryWithDefaults instantiates a new Delivery object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *Delivery) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Delivery) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Delivery) SetId(v string)`

SetId sets Id field to given value.


### GetEndpointId

`func (o *Delivery) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *Delivery) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *Delivery) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetEvent

`func (o *Delivery) GetEvent() string`

GetEvent returns the Event field if non-nil, zero value otherwise.

### GetEventOk

`func (o *Delivery) GetEventOk() (*string, bool)`

GetEventOk returns a tuple with the Event field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvent

`func (o *Delivery) SetEvent(v string)`

SetEvent sets Event field to given value.

### HasEvent

`func (o *Delivery) HasEvent() bool`

HasEvent returns a boolean if a field has been set.

### SetEventNil

`func (o *Delivery) SetEventNil(b bool)`

 SetEventNil sets the value for Event to be an explicit nil

### UnsetEvent
`func (o *Delivery) UnsetEvent()`

UnsetEvent ensures that no value is present for Event, not even an explicit nil
### GetStatus

`func (o *Delivery) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *Delivery) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *Delivery) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetAttemptCount

`func (o *Delivery) GetAttemptCount() int32`

GetAttemptCount returns the AttemptCount field if non-nil, zero value otherwise.

### GetAttemptCountOk

`func (o *Delivery) GetAttemptCountOk() (*int32, bool)`

GetAttemptCountOk returns a tuple with the AttemptCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAttemptCount

`func (o *Delivery) SetAttemptCount(v int32)`

SetAttemptCount sets AttemptCount field to given value.


### GetResponseStatus

`func (o *Delivery) GetResponseStatus() int32`

GetResponseStatus returns the ResponseStatus field if non-nil, zero value otherwise.

### GetResponseStatusOk

`func (o *Delivery) GetResponseStatusOk() (*int32, bool)`

GetResponseStatusOk returns a tuple with the ResponseStatus field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResponseStatus

`func (o *Delivery) SetResponseStatus(v int32)`

SetResponseStatus sets ResponseStatus field to given value.

### HasResponseStatus

`func (o *Delivery) HasResponseStatus() bool`

HasResponseStatus returns a boolean if a field has been set.

### SetResponseStatusNil

`func (o *Delivery) SetResponseStatusNil(b bool)`

 SetResponseStatusNil sets the value for ResponseStatus to be an explicit nil

### UnsetResponseStatus
`func (o *Delivery) UnsetResponseStatus()`

UnsetResponseStatus ensures that no value is present for ResponseStatus, not even an explicit nil
### GetReplayCount

`func (o *Delivery) GetReplayCount() int32`

GetReplayCount returns the ReplayCount field if non-nil, zero value otherwise.

### GetReplayCountOk

`func (o *Delivery) GetReplayCountOk() (*int32, bool)`

GetReplayCountOk returns a tuple with the ReplayCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetReplayCount

`func (o *Delivery) SetReplayCount(v int32)`

SetReplayCount sets ReplayCount field to given value.


### GetCreatedAt

`func (o *Delivery) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *Delivery) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *Delivery) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


