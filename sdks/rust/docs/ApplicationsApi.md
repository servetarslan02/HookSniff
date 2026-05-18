# \ApplicationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**applications_get**](ApplicationsApi.md#applications_get) | **GET** /applications | List applications
[**applications_id_delete**](ApplicationsApi.md#applications_id_delete) | **DELETE** /applications/{id} | Delete application
[**applications_id_get**](ApplicationsApi.md#applications_id_get) | **GET** /applications/{id} | Get application
[**applications_id_put**](ApplicationsApi.md#applications_id_put) | **PUT** /applications/{id} | Update application
[**applications_post**](ApplicationsApi.md#applications_post) | **POST** /applications | Create application



## applications_get

> Vec<models::Application> applications_get()
List applications

Returns all applications for the authenticated user

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::Application>**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## applications_id_delete

> applications_id_delete(id)
Delete application

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## applications_id_get

> models::Application applications_id_get(id)
Get application

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## applications_id_put

> models::Application applications_id_put(id, applications_id_put_request)
Update application

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**applications_id_put_request** | Option<[**ApplicationsIdPutRequest**](ApplicationsIdPutRequest.md)> |  |  |

### Return type

[**models::Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## applications_post

> models::Application applications_post(applications_post_request)
Create application

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**applications_post_request** | [**ApplicationsPostRequest**](ApplicationsPostRequest.md) |  | [required] |

### Return type

[**models::Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

