# \NotificationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**notifications_get**](NotificationsApi.md#notifications_get) | **GET** /notifications | List notifications
[**notifications_id_delete**](NotificationsApi.md#notifications_id_delete) | **DELETE** /notifications/{id} | Delete notification
[**notifications_id_read_put**](NotificationsApi.md#notifications_id_read_put) | **PUT** /notifications/{id}/read | Mark notification as read
[**notifications_read_all_put**](NotificationsApi.md#notifications_read_all_put) | **PUT** /notifications/read-all | Mark all notifications as read
[**notifications_unread_count_get**](NotificationsApi.md#notifications_unread_count_get) | **GET** /notifications/unread-count | Get unread notification count



## notifications_get

> models::NotificationListResponse notifications_get(page, per_page)
List notifications

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**page** | Option<**i32**> |  |  |
**per_page** | Option<**i32**> |  |  |

### Return type

[**models::NotificationListResponse**](NotificationListResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## notifications_id_delete

> notifications_id_delete(id)
Delete notification

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## notifications_id_read_put

> notifications_id_read_put(id)
Mark notification as read

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## notifications_read_all_put

> notifications_read_all_put()
Mark all notifications as read

### Parameters

This endpoint does not need any parameter.

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## notifications_unread_count_get

> models::NotificationsUnreadCountGet200Response notifications_unread_count_get()
Get unread notification count

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::NotificationsUnreadCountGet200Response**](_notifications_unread_count_get_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

