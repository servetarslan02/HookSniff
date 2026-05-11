# \SsoApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**sso_config_delete**](SsoApi.md#sso_config_delete) | **DELETE** /sso/config | Delete SSO configuration
[**sso_config_get**](SsoApi.md#sso_config_get) | **GET** /sso/config | Get SSO configuration
[**sso_config_post**](SsoApi.md#sso_config_post) | **POST** /sso/config | Create/update SSO configuration
[**sso_test_post**](SsoApi.md#sso_test_post) | **POST** /sso/test | Test SSO connection



## sso_config_delete

> sso_config_delete()
Delete SSO configuration

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


## sso_config_get

> sso_config_get()
Get SSO configuration

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


## sso_config_post

> sso_config_post(sso_config_post_request)
Create/update SSO configuration

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**sso_config_post_request** | Option<[**SsoConfigPostRequest**](SsoConfigPostRequest.md)> |  |  |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## sso_test_post

> sso_test_post()
Test SSO connection

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

