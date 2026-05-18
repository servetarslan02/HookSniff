# NotificationsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**notificationsGet**](NotificationsAPI.md#notificationsget) | **GET** /notifications | List notifications
[**notificationsIdDelete**](NotificationsAPI.md#notificationsiddelete) | **DELETE** /notifications/{id} | Delete notification
[**notificationsIdReadPut**](NotificationsAPI.md#notificationsidreadput) | **PUT** /notifications/{id}/read | Mark notification as read
[**notificationsReadAllPut**](NotificationsAPI.md#notificationsreadallput) | **PUT** /notifications/read-all | Mark all notifications as read
[**notificationsUnreadCountGet**](NotificationsAPI.md#notificationsunreadcountget) | **GET** /notifications/unread-count | Get unread notification count


# **notificationsGet**
```swift
    open class func notificationsGet(page: Int? = nil, perPage: Int? = nil, completion: @escaping (_ data: NotificationListResponse?, _ error: Error?) -> Void)
```

List notifications

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let page = 987 // Int |  (optional)
let perPage = 987 // Int |  (optional)

// List notifications
NotificationsAPI.notificationsGet(page: page, perPage: perPage) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **Int** |  | [optional] 
 **perPage** | **Int** |  | [optional] 

### Return type

[**NotificationListResponse**](NotificationListResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsIdDelete**
```swift
    open class func notificationsIdDelete(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete notification

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Delete notification
NotificationsAPI.notificationsIdDelete(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsIdReadPut**
```swift
    open class func notificationsIdReadPut(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Mark notification as read

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Mark notification as read
NotificationsAPI.notificationsIdReadPut(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsReadAllPut**
```swift
    open class func notificationsReadAllPut(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Mark all notifications as read

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Mark all notifications as read
NotificationsAPI.notificationsReadAllPut() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationsUnreadCountGet**
```swift
    open class func notificationsUnreadCountGet(completion: @escaping (_ data: NotificationsUnreadCountGet200Response?, _ error: Error?) -> Void)
```

Get unread notification count

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get unread notification count
NotificationsAPI.notificationsUnreadCountGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**NotificationsUnreadCountGet200Response**](NotificationsUnreadCountGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

