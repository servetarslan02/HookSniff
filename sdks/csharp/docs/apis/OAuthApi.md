# HookSniff.Api.OAuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**OauthGoogleCallbackGet**](OAuthApi.md#oauthgooglecallbackget) | **GET** /oauth/google/callback | Google OAuth callback |
| [**OauthGoogleGet**](OAuthApi.md#oauthgoogleget) | **GET** /oauth/google | Google OAuth login redirect |
| [**OauthProvidersGet**](OAuthApi.md#oauthprovidersget) | **GET** /oauth/providers | List available OAuth providers |

<a id="oauthgooglecallbackget"></a>
# **OauthGoogleCallbackGet**
> void OauthGoogleCallbackGet ()

Google OAuth callback


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
| **200** | Authenticated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="oauthgoogleget"></a>
# **OauthGoogleGet**
> void OauthGoogleGet ()

Google OAuth login redirect


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
| **302** | Redirect to Google |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="oauthprovidersget"></a>
# **OauthProvidersGet**
> void OauthProvidersGet ()

List available OAuth providers


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
| **200** | Provider list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

