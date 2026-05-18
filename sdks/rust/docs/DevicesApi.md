# \DevicesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**devices_get**](DevicesApi.md#devices_get) | **GET** /devices | List registered devices
[**devices_post**](DevicesApi.md#devices_post) | **POST** /devices | Register device for push notifications
[**devices_token_delete**](DevicesApi.md#devices_token_delete) | **DELETE** /devices/{token} | Remove device token



## devices_get

> Vec<models::DeviceTokenResponse> devices_get()
List registered devices

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::DeviceTokenResponse>**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## devices_post

> models::DeviceTokenResponse devices_post(register_device_request)
Register device for push notifications

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**register_device_request** | [**RegisterDeviceRequest**](RegisterDeviceRequest.md) |  | [required] |

### Return type

[**models::DeviceTokenResponse**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## devices_token_delete

> devices_token_delete(token)
Remove device token

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**token** | **String** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

