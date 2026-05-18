# EventTypeCount

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Event** | Pointer to **NullableString** |  | [optional] 
**Count** | **int32** |  | 

## Methods

### NewEventTypeCount

`func NewEventTypeCount(count int32, ) *EventTypeCount`

NewEventTypeCount instantiates a new EventTypeCount object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEventTypeCountWithDefaults

`func NewEventTypeCountWithDefaults() *EventTypeCount`

NewEventTypeCountWithDefaults instantiates a new EventTypeCount object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEvent

`func (o *EventTypeCount) GetEvent() string`

GetEvent returns the Event field if non-nil, zero value otherwise.

### GetEventOk

`func (o *EventTypeCount) GetEventOk() (*string, bool)`

GetEventOk returns a tuple with the Event field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvent

`func (o *EventTypeCount) SetEvent(v string)`

SetEvent sets Event field to given value.

### HasEvent

`func (o *EventTypeCount) HasEvent() bool`

HasEvent returns a boolean if a field has been set.

### SetEventNil

`func (o *EventTypeCount) SetEventNil(b bool)`

 SetEventNil sets the value for Event to be an explicit nil

### UnsetEvent
`func (o *EventTypeCount) UnsetEvent()`

UnsetEvent ensures that no value is present for Event, not even an explicit nil
### GetCount

`func (o *EventTypeCount) GetCount() int32`

GetCount returns the Count field if non-nil, zero value otherwise.

### GetCountOk

`func (o *EventTypeCount) GetCountOk() (*int32, bool)`

GetCountOk returns a tuple with the Count field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCount

`func (o *EventTypeCount) SetCount(v int32)`

SetCount sets Count field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


