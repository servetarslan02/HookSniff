# hooksniff.Api.DevicesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**DevicesGet**](DevicesApi.md#devicesget) | **GET** /devices | List registered devices |
| [**DevicesPost**](DevicesApi.md#devicespost) | **POST** /devices | Register device for push notifications |
| [**DevicesTokenDelete**](DevicesApi.md#devicestokendelete) | **DELETE** /devices/{token} | Remove device token |

<a id="devicesget"></a>
# **DevicesGet**
> List&lt;DeviceTokenResponse&gt; DevicesGet ()

List registered devices


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;DeviceTokenResponse&gt;**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Device list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="devicespost"></a>
# **DevicesPost**
> DeviceTokenResponse DevicesPost (RegisterDeviceRequest registerDeviceRequest)

Register device for push notifications


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **registerDeviceRequest** | [**RegisterDeviceRequest**](RegisterDeviceRequest.md) |  |  |

### Return type

[**DeviceTokenResponse**](DeviceTokenResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Device registered |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="devicestokendelete"></a>
# **DevicesTokenDelete**
> void DevicesTokenDelete (string token)

Remove device token


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **token** | **string** |  |  |

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
| **200** | Device removed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

