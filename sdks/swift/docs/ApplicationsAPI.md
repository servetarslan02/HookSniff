# ApplicationsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**applicationsGet**](ApplicationsAPI.md#applicationsget) | **GET** /applications | List applications
[**applicationsIdDelete**](ApplicationsAPI.md#applicationsiddelete) | **DELETE** /applications/{id} | Delete application
[**applicationsIdGet**](ApplicationsAPI.md#applicationsidget) | **GET** /applications/{id} | Get application
[**applicationsIdPut**](ApplicationsAPI.md#applicationsidput) | **PUT** /applications/{id} | Update application
[**applicationsPost**](ApplicationsAPI.md#applicationspost) | **POST** /applications | Create application


# **applicationsGet**
```swift
    open class func applicationsGet(completion: @escaping (_ data: [Application]?, _ error: Error?) -> Void)
```

List applications

Returns all applications for the authenticated user

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List applications
ApplicationsAPI.applicationsGet() { (response, error) in
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

[**[Application]**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **applicationsIdDelete**
```swift
    open class func applicationsIdDelete(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete application

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Delete application
ApplicationsAPI.applicationsIdDelete(id: id) { (response, error) in
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

# **applicationsIdGet**
```swift
    open class func applicationsIdGet(id: UUID, completion: @escaping (_ data: Application?, _ error: Error?) -> Void)
```

Get application

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get application
ApplicationsAPI.applicationsIdGet(id: id) { (response, error) in
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

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **applicationsIdPut**
```swift
    open class func applicationsIdPut(id: UUID, applicationsIdPutRequest: ApplicationsIdPutRequest? = nil, completion: @escaping (_ data: Application?, _ error: Error?) -> Void)
```

Update application

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let applicationsIdPutRequest = _applications__id__put_request(name: "name_example", description: "description_example", isActive: false) // ApplicationsIdPutRequest |  (optional)

// Update application
ApplicationsAPI.applicationsIdPut(id: id, applicationsIdPutRequest: applicationsIdPutRequest) { (response, error) in
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
 **applicationsIdPutRequest** | [**ApplicationsIdPutRequest**](ApplicationsIdPutRequest.md) |  | [optional] 

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **applicationsPost**
```swift
    open class func applicationsPost(applicationsPostRequest: ApplicationsPostRequest, completion: @escaping (_ data: Application?, _ error: Error?) -> Void)
```

Create application

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let applicationsPostRequest = _applications_post_request(name: "name_example", description: "description_example") // ApplicationsPostRequest | 

// Create application
ApplicationsAPI.applicationsPost(applicationsPostRequest: applicationsPostRequest) { (response, error) in
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
 **applicationsPostRequest** | [**ApplicationsPostRequest**](ApplicationsPostRequest.md) |  | 

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

