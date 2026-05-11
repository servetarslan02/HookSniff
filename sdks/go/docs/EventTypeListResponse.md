# EventTypeListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | [**[]EventType**](EventType.md) |  | 
**HasMore** | **bool** |  | 
**Total** | **int32** |  | 

## Methods

### NewEventTypeListResponse

`func NewEventTypeListResponse(data []EventType, hasMore bool, total int32, ) *EventTypeListResponse`

NewEventTypeListResponse instantiates a new EventTypeListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEventTypeListResponseWithDefaults

`func NewEventTypeListResponseWithDefaults() *EventTypeListResponse`

NewEventTypeListResponseWithDefaults instantiates a new EventTypeListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *EventTypeListResponse) GetData() []EventType`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *EventTypeListResponse) GetDataOk() (*[]EventType, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *EventTypeListResponse) SetData(v []EventType)`

SetData sets Data field to given value.


### GetHasMore

`func (o *EventTypeListResponse) GetHasMore() bool`

GetHasMore returns the HasMore field if non-nil, zero value otherwise.

### GetHasMoreOk

`func (o *EventTypeListResponse) GetHasMoreOk() (*bool, bool)`

GetHasMoreOk returns a tuple with the HasMore field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasMore

`func (o *EventTypeListResponse) SetHasMore(v bool)`

SetHasMore sets HasMore field to given value.


### GetTotal

`func (o *EventTypeListResponse) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *EventTypeListResponse) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *EventTypeListResponse) SetTotal(v int32)`

SetTotal sets Total field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


