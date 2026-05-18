# hooksniff.Api.ApplicationsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**ApplicationsGet**](ApplicationsApi.md#applicationsget) | **GET** /applications | List applications |
| [**ApplicationsIdDelete**](ApplicationsApi.md#applicationsiddelete) | **DELETE** /applications/{id} | Delete application |
| [**ApplicationsIdGet**](ApplicationsApi.md#applicationsidget) | **GET** /applications/{id} | Get application |
| [**ApplicationsIdPut**](ApplicationsApi.md#applicationsidput) | **PUT** /applications/{id} | Update application |
| [**ApplicationsPost**](ApplicationsApi.md#applicationspost) | **POST** /applications | Create application |

<a id="applicationsget"></a>
# **ApplicationsGet**
> List&lt;Application&gt; ApplicationsGet ()

List applications

Returns all applications for the authenticated user


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;Application&gt;**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of applications |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="applicationsiddelete"></a>
# **ApplicationsIdDelete**
> void ApplicationsIdDelete (Guid id)

Delete application


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

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
| **200** | Application deleted |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="applicationsidget"></a>
# **ApplicationsIdGet**
> Application ApplicationsIdGet (Guid id)

Get application


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Application details |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="applicationsidput"></a>
# **ApplicationsIdPut**
> Application ApplicationsIdPut (Guid id, ApplicationsIdPutRequest applicationsIdPutRequest = null)

Update application


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **applicationsIdPutRequest** | [**ApplicationsIdPutRequest**](ApplicationsIdPutRequest.md) |  | [optional]  |

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Application updated |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="applicationspost"></a>
# **ApplicationsPost**
> Application ApplicationsPost (ApplicationsPostRequest applicationsPostRequest)

Create application


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **applicationsPostRequest** | [**ApplicationsPostRequest**](ApplicationsPostRequest.md) |  |  |

### Return type

[**Application**](Application.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Application created |  -  |
| **400** | Validation error |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

