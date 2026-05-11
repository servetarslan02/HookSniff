# hooksniff.Api.CustomDomainsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**CustomDomainsGet**](CustomDomainsApi.md#customdomainsget) | **GET** /custom-domains | List custom domains |
| [**CustomDomainsIdDelete**](CustomDomainsApi.md#customdomainsiddelete) | **DELETE** /custom-domains/{id} | Delete custom domain |
| [**CustomDomainsIdVerifyPost**](CustomDomainsApi.md#customdomainsidverifypost) | **POST** /custom-domains/{id}/verify | Verify domain ownership |
| [**CustomDomainsPost**](CustomDomainsApi.md#customdomainspost) | **POST** /custom-domains | Add custom domain |

<a id="customdomainsget"></a>
# **CustomDomainsGet**
> void CustomDomainsGet ()

List custom domains


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
| **200** | Domain list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="customdomainsiddelete"></a>
# **CustomDomainsIdDelete**
> void CustomDomainsIdDelete (string id)

Delete custom domain


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **string** |  |  |

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
| **200** | Domain deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="customdomainsidverifypost"></a>
# **CustomDomainsIdVerifyPost**
> void CustomDomainsIdVerifyPost (string id)

Verify domain ownership


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **string** |  |  |

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
| **200** | Verification result |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="customdomainspost"></a>
# **CustomDomainsPost**
> void CustomDomainsPost (CustomDomainsPostRequest customDomainsPostRequest = null)

Add custom domain


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **customDomainsPostRequest** | [**CustomDomainsPostRequest**](CustomDomainsPostRequest.md) |  | [optional]  |

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
| **201** | Domain added |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

