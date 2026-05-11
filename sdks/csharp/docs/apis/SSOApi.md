# hooksniff.Api.SSOApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**SsoConfigDelete**](SSOApi.md#ssoconfigdelete) | **DELETE** /sso/config | Delete SSO configuration |
| [**SsoConfigGet**](SSOApi.md#ssoconfigget) | **GET** /sso/config | Get SSO configuration |
| [**SsoConfigPost**](SSOApi.md#ssoconfigpost) | **POST** /sso/config | Create/update SSO configuration |
| [**SsoTestPost**](SSOApi.md#ssotestpost) | **POST** /sso/test | Test SSO connection |

<a id="ssoconfigdelete"></a>
# **SsoConfigDelete**
> void SsoConfigDelete ()

Delete SSO configuration


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
| **200** | SSO config deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="ssoconfigget"></a>
# **SsoConfigGet**
> void SsoConfigGet ()

Get SSO configuration


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
| **200** | SSO config |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="ssoconfigpost"></a>
# **SsoConfigPost**
> void SsoConfigPost (SsoConfigPostRequest ssoConfigPostRequest = null)

Create/update SSO configuration


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **ssoConfigPostRequest** | [**SsoConfigPostRequest**](SsoConfigPostRequest.md) |  | [optional]  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | SSO config saved |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="ssotestpost"></a>
# **SsoTestPost**
> void SsoTestPost ()

Test SSO connection


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
| **200** | Connection test result |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

