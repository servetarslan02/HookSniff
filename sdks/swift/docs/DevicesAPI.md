# DevicesAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**devicesGet**](DevicesAPI.md#devicesget) | **GET** /devices | List registered devices
[**devicesPost**](DevicesAPI.md#devicespost) | **POST** /devices | Register device for push notifications
[**devicesTokenDelete**](DevicesAPI.md#devicestokendelete) | **DELETE** /devices/{token} | Remove device token


# **devicesGet**
```swift
    open class func devicesGet(completion: @escaping (_ data: [DeviceTokenResponse]?, _ error: Error?) -> Void)
```

List registered devices

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List registered devices
DevicesAPI.devicesGet() { (response, error) in
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

[**[DeviceTokenResponse]**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesPost**
```swift
    open class func devicesPost(registerDeviceRequest: RegisterDeviceRequest, completion: @escaping (_ data: DeviceTokenResponse?, _ error: Error?) -> Void)
```

Register device for push notifications

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let registerDeviceRequest = RegisterDeviceRequest(token: "token_example", platform: "platform_example") // RegisterDeviceRequest | 

// Register device for push notifications
DevicesAPI.devicesPost(registerDeviceRequest: registerDeviceRequest) { (response, error) in
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
 **registerDeviceRequest** | [**RegisterDeviceRequest**](RegisterDeviceRequest.md) |  | 

### Return type

[**DeviceTokenResponse**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **devicesTokenDelete**
```swift
    open class func devicesTokenDelete(token: String, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Remove device token

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let token = "token_example" // String | 

// Remove device token
DevicesAPI.devicesTokenDelete(token: token) { (response, error) in
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
 **token** | **String** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

