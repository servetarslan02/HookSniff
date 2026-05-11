# NotificationListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Notifications** | [**[]Notification**](Notification.md) |  | 
**Total** | **int32** |  | 
**UnreadCount** | **int32** |  | 

## Methods

### NewNotificationListResponse

`func NewNotificationListResponse(notifications []Notification, total int32, unreadCount int32, ) *NotificationListResponse`

NewNotificationListResponse instantiates a new NotificationListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewNotificationListResponseWithDefaults

`func NewNotificationListResponseWithDefaults() *NotificationListResponse`

NewNotificationListResponseWithDefaults instantiates a new NotificationListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetNotifications

`func (o *NotificationListResponse) GetNotifications() []Notification`

GetNotifications returns the Notifications field if non-nil, zero value otherwise.

### GetNotificationsOk

`func (o *NotificationListResponse) GetNotificationsOk() (*[]Notification, bool)`

GetNotificationsOk returns a tuple with the Notifications field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNotifications

`func (o *NotificationListResponse) SetNotifications(v []Notification)`

SetNotifications sets Notifications field to given value.


### GetTotal

`func (o *NotificationListResponse) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *NotificationListResponse) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *NotificationListResponse) SetTotal(v int32)`

SetTotal sets Total field to given value.


### GetUnreadCount

`func (o *NotificationListResponse) GetUnreadCount() int32`

GetUnreadCount returns the UnreadCount field if non-nil, zero value otherwise.

### GetUnreadCountOk

`func (o *NotificationListResponse) GetUnreadCountOk() (*int32, bool)`

GetUnreadCountOk returns a tuple with the UnreadCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUnreadCount

`func (o *NotificationListResponse) SetUnreadCount(v int32)`

SetUnreadCount sets UnreadCount field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


