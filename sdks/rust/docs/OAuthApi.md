# \OAuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**oauth_github_callback_get**](OAuthApi.md#oauth_github_callback_get) | **GET** /oauth/github/callback | GitHub OAuth callback
[**oauth_github_get**](OAuthApi.md#oauth_github_get) | **GET** /oauth/github | GitHub OAuth login redirect
[**oauth_google_callback_get**](OAuthApi.md#oauth_google_callback_get) | **GET** /oauth/google/callback | Google OAuth callback
[**oauth_google_get**](OAuthApi.md#oauth_google_get) | **GET** /oauth/google | Google OAuth login redirect
[**oauth_providers_get**](OAuthApi.md#oauth_providers_get) | **GET** /oauth/providers | List available OAuth providers



## oauth_github_callback_get

> oauth_github_callback_get(code, state, error)
GitHub OAuth callback

Handles GitHub OAuth callback, creates/links account, sets auth cookies

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**code** | **String** | Authorization code from GitHub | [required] |
**state** | **String** | CSRF state token (verified against cookie) | [required] |
**error** | Option<**String**> | Error from GitHub (e.g. access_denied) |  |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## oauth_github_get

> oauth_github_get()
GitHub OAuth login redirect

Redirects to GitHub OAuth consent screen with CSRF state cookie

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


## oauth_google_callback_get

> oauth_google_callback_get()
Google OAuth callback

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


## oauth_google_get

> oauth_google_get()
Google OAuth login redirect

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


## oauth_providers_get

> oauth_providers_get()
List available OAuth providers

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

