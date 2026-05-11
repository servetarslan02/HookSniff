# SchemasAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**schemasGet**](SchemasAPI.md#schemasget) | **GET** /schemas | List registered schemas
[**schemasIdGet**](SchemasAPI.md#schemasidget) | **GET** /schemas/{id} | Get schema by ID
[**schemasIdValidatePost**](SchemasAPI.md#schemasidvalidatepost) | **POST** /schemas/{id}/validate | Validate an event against a schema
[**schemasPost**](SchemasAPI.md#schemaspost) | **POST** /schemas | Register a new JSON Schema


# **schemasGet**
```swift
    open class func schemasGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

List registered schemas

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List registered schemas
SchemasAPI.schemasGet() { (response, error) in
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

# **schemasIdGet**
```swift
    open class func schemasIdGet(id: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get schema by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get schema by ID
SchemasAPI.schemasIdGet(id: id) { (response, error) in
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

# **schemasIdValidatePost**
```swift
    open class func schemasIdValidatePost(id: UUID, validateEventRequest: ValidateEventRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Validate an event against a schema

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let validateEventRequest = ValidateEventRequest(event: 123) // ValidateEventRequest | 

// Validate an event against a schema
SchemasAPI.schemasIdValidatePost(id: id, validateEventRequest: validateEventRequest) { (response, error) in
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
 **validateEventRequest** | [**ValidateEventRequest**](ValidateEventRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **schemasPost**
```swift
    open class func schemasPost(registerSchemaRequest: RegisterSchemaRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Register a new JSON Schema

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let registerSchemaRequest = RegisterSchemaRequest(name: "name_example", schema: 123) // RegisterSchemaRequest | 

// Register a new JSON Schema
SchemasAPI.schemasPost(registerSchemaRequest: registerSchemaRequest) { (response, error) in
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
 **registerSchemaRequest** | [**RegisterSchemaRequest**](RegisterSchemaRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

