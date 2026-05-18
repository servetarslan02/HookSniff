# \CustomDomainsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**custom_domains_get**](CustomDomainsApi.md#custom_domains_get) | **GET** /custom-domains | List custom domains
[**custom_domains_id_delete**](CustomDomainsApi.md#custom_domains_id_delete) | **DELETE** /custom-domains/{id} | Delete custom domain
[**custom_domains_id_verify_post**](CustomDomainsApi.md#custom_domains_id_verify_post) | **POST** /custom-domains/{id}/verify | Verify domain ownership
[**custom_domains_post**](CustomDomainsApi.md#custom_domains_post) | **POST** /custom-domains | Add custom domain



## custom_domains_get

> custom_domains_get()
List custom domains

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


## custom_domains_id_delete

> custom_domains_id_delete(id)
Delete custom domain

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **String** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## custom_domains_id_verify_post

> custom_domains_id_verify_post(id)
Verify domain ownership

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **String** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## custom_domains_post

> custom_domains_post(custom_domains_post_request)
Add custom domain

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**custom_domains_post_request** | Option<[**CustomDomainsPostRequest**](CustomDomainsPostRequest.md)> |  |  |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

