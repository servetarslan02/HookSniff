# hooksniff.Api.NotificationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**NotificationsGet**](NotificationsApi.md#notificationsget) | **GET** /notifications | List notifications |
| [**NotificationsIdDelete**](NotificationsApi.md#notificationsiddelete) | **DELETE** /notifications/{id} | Delete notification |
| [**NotificationsIdReadPut**](NotificationsApi.md#notificationsidreadput) | **PUT** /notifications/{id}/read | Mark notification as read |
| [**NotificationsReadAllPut**](NotificationsApi.md#notificationsreadallput) | **PUT** /notifications/read-all | Mark all notifications as read |
| [**NotificationsUnreadCountGet**](NotificationsApi.md#notificationsunreadcountget) | **GET** /notifications/unread-count | Get unread notification count |

<a id="notificationsget"></a>
# **NotificationsGet**
> NotificationListResponse NotificationsGet (int page = null, int perPage = null)

List notifications


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **page** | **int** |  | [optional]  |
| **perPage** | **int** |  | [optional]  |

### Return type

[**NotificationListResponse**](NotificationListResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Notification list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="notificationsiddelete"></a>
# **NotificationsIdDelete**
> void NotificationsIdDelete (Guid id)

Delete notification


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Notification deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="notificationsidreadput"></a>
# **NotificationsIdReadPut**
> void NotificationsIdReadPut (Guid id)

Mark notification as read


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Marked as read |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="notificationsreadallput"></a>
# **NotificationsReadAllPut**
> void NotificationsReadAllPut ()

Mark all notifications as read


### Parameters
This endpoint does not need any parameter.
### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | All marked as read |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="notificationsunreadcountget"></a>
# **NotificationsUnreadCountGet**
> NotificationsUnreadCountGet200Response NotificationsUnreadCountGet ()

Get unread notification count


### Parameters
This endpoint does not need any parameter.
### Return type

[**NotificationsUnreadCountGet200Response**](NotificationsUnreadCountGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Unread count |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

