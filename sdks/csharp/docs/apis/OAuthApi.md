# hooksniff.Api.OAuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**OauthGithubCallbackGet**](OAuthApi.md#oauthgithubcallbackget) | **GET** /oauth/github/callback | GitHub OAuth callback |
| [**OauthGithubGet**](OAuthApi.md#oauthgithubget) | **GET** /oauth/github | GitHub OAuth login redirect |
| [**OauthGoogleCallbackGet**](OAuthApi.md#oauthgooglecallbackget) | **GET** /oauth/google/callback | Google OAuth callback |
| [**OauthGoogleGet**](OAuthApi.md#oauthgoogleget) | **GET** /oauth/google | Google OAuth login redirect |
| [**OauthProvidersGet**](OAuthApi.md#oauthprovidersget) | **GET** /oauth/providers | List available OAuth providers |

<a id="oauthgithubcallbackget"></a>
# **OauthGithubCallbackGet**
> void OauthGithubCallbackGet (string code, string state, string error = null)

GitHub OAuth callback

Handles GitHub OAuth callback, creates/links account, sets auth cookies


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **code** | **string** | Authorization code from GitHub |  |
| **state** | **string** | CSRF state token (verified against cookie) |  |
| **error** | **string** | Error from GitHub (e.g. access_denied) | [optional]  |

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
| **302** | Redirect to app with auth cookies set |  -  |
| **400** | Invalid or missing authorization code |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="oauthgithubget"></a>
# **OauthGithubGet**
> void OauthGithubGet ()

GitHub OAuth login redirect

Redirects to GitHub OAuth consent screen with CSRF state cookie


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
| **302** | Redirect to GitHub OAuth |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

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

