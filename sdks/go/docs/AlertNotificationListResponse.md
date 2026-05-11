# AlertNotificationListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | [**[]AlertNotificationListResponseDataInner**](AlertNotificationListResponseDataInner.md) |  | 
**HasMore** | **bool** |  | 
**Total** | **int32** |  | 

## Methods

### NewAlertNotificationListResponse

`func NewAlertNotificationListResponse(data []AlertNotificationListResponseDataInner, hasMore bool, total int32, ) *AlertNotificationListResponse`

NewAlertNotificationListResponse instantiates a new AlertNotificationListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAlertNotificationListResponseWithDefaults

`func NewAlertNotificationListResponseWithDefaults() *AlertNotificationListResponse`

NewAlertNotificationListResponseWithDefaults instantiates a new AlertNotificationListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *AlertNotificationListResponse) GetData() []AlertNotificationListResponseDataInner`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *AlertNotificationListResponse) GetDataOk() (*[]AlertNotificationListResponseDataInner, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *AlertNotificationListResponse) SetData(v []AlertNotificationListResponseDataInner)`

SetData sets Data field to given value.


### GetHasMore

`func (o *AlertNotificationListResponse) GetHasMore() bool`

GetHasMore returns the HasMore field if non-nil, zero value otherwise.

### GetHasMoreOk

`func (o *AlertNotificationListResponse) GetHasMoreOk() (*bool, bool)`

GetHasMoreOk returns a tuple with the HasMore field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasMore

`func (o *AlertNotificationListResponse) SetHasMore(v bool)`

SetHasMore sets HasMore field to given value.


### GetTotal

`func (o *AlertNotificationListResponse) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *AlertNotificationListResponse) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *AlertNotificationListResponse) SetTotal(v int32)`

SetTotal sets Total field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


