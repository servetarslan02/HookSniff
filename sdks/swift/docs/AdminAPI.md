# AdminAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**adminRevenueGet**](AdminAPI.md#adminrevenueget) | **GET** /admin/revenue | Revenue by month (admin)
[**adminSdkUpdatePost**](AdminAPI.md#adminsdkupdatepost) | **POST** /admin/sdk-update | Send SDK update notification to users
[**adminStatsGet**](AdminAPI.md#adminstatsget) | **GET** /admin/stats | System-wide statistics (admin)
[**adminUsersGet**](AdminAPI.md#adminusersget) | **GET** /admin/users | List all users (admin)
[**adminUsersIdGet**](AdminAPI.md#adminusersidget) | **GET** /admin/users/{id} | Get user details (admin)
[**adminUsersIdPlanPut**](AdminAPI.md#adminusersidplanput) | **PUT** /admin/users/{id}/plan | Change user plan (admin)
[**adminUsersIdStatusPut**](AdminAPI.md#adminusersidstatusput) | **PUT** /admin/users/{id}/status | Change user status (admin)


# **adminRevenueGet**
```swift
    open class func adminRevenueGet(completion: @escaping (_ data: [AdminRevenueGet200ResponseInner]?, _ error: Error?) -> Void)
```

Revenue by month (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Revenue by month (admin)
AdminAPI.adminRevenueGet() { (response, error) in
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

[**[AdminRevenueGet200ResponseInner]**](AdminRevenueGet200ResponseInner.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminSdkUpdatePost**
```swift
    open class func adminSdkUpdatePost(adminSdkUpdatePostRequest: AdminSdkUpdatePostRequest? = nil, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Send SDK update notification to users

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let adminSdkUpdatePostRequest = _admin_sdk_update_post_request(version: "version_example", message: "message_example") // AdminSdkUpdatePostRequest |  (optional)

// Send SDK update notification to users
AdminAPI.adminSdkUpdatePost(adminSdkUpdatePostRequest: adminSdkUpdatePostRequest) { (response, error) in
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
 **adminSdkUpdatePostRequest** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md) |  | [optional] 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminStatsGet**
```swift
    open class func adminStatsGet(completion: @escaping (_ data: SystemStats?, _ error: Error?) -> Void)
```

System-wide statistics (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// System-wide statistics (admin)
AdminAPI.adminStatsGet() { (response, error) in
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

[**SystemStats**](SystemStats.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersGet**
```swift
    open class func adminUsersGet(page: Int? = nil, perPage: Int? = nil, completion: @escaping (_ data: PaginatedUsers?, _ error: Error?) -> Void)
```

List all users (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let page = 987 // Int |  (optional)
let perPage = 987 // Int |  (optional)

// List all users (admin)
AdminAPI.adminUsersGet(page: page, perPage: perPage) { (response, error) in
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

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersIdGet**
```swift
    open class func adminUsersIdGet(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get user details (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get user details (admin)
AdminAPI.adminUsersIdGet(id: id) { (response, error) in
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

# **adminUsersIdPlanPut**
```swift
    open class func adminUsersIdPlanPut(id: UUID, adminUsersIdPlanPutRequest: AdminUsersIdPlanPutRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Change user plan (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let adminUsersIdPlanPutRequest = _admin_users__id__plan_put_request(plan: "plan_example") // AdminUsersIdPlanPutRequest | 

// Change user plan (admin)
AdminAPI.adminUsersIdPlanPut(id: id, adminUsersIdPlanPutRequest: adminUsersIdPlanPutRequest) { (response, error) in
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
 **adminUsersIdPlanPutRequest** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **adminUsersIdStatusPut**
```swift
    open class func adminUsersIdStatusPut(id: UUID, adminUsersIdStatusPutRequest: AdminUsersIdStatusPutRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Change user status (admin)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let adminUsersIdStatusPutRequest = _admin_users__id__status_put_request(isActive: false) // AdminUsersIdStatusPutRequest | 

// Change user status (admin)
AdminAPI.adminUsersIdStatusPut(id: id, adminUsersIdStatusPutRequest: adminUsersIdStatusPutRequest) { (response, error) in
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
 **adminUsersIdStatusPutRequest** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

