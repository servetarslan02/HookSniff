# hooksniff.Api.AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**AdminRevenueGet**](AdminApi.md#adminrevenueget) | **GET** /admin/revenue | Revenue by month (admin) |
| [**AdminSdkUpdatePost**](AdminApi.md#adminsdkupdatepost) | **POST** /admin/sdk-update | Send SDK update notification to users |
| [**AdminStatsGet**](AdminApi.md#adminstatsget) | **GET** /admin/stats | System-wide statistics (admin) |
| [**AdminUsersGet**](AdminApi.md#adminusersget) | **GET** /admin/users | List all users (admin) |
| [**AdminUsersIdGet**](AdminApi.md#adminusersidget) | **GET** /admin/users/{id} | Get user details (admin) |
| [**AdminUsersIdPlanPut**](AdminApi.md#adminusersidplanput) | **PUT** /admin/users/{id}/plan | Change user plan (admin) |
| [**AdminUsersIdStatusPut**](AdminApi.md#adminusersidstatusput) | **PUT** /admin/users/{id}/status | Change user status (admin) |

<a id="adminrevenueget"></a>
# **AdminRevenueGet**
> List&lt;AdminRevenueGet200ResponseInner&gt; AdminRevenueGet ()

Revenue by month (admin)


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;AdminRevenueGet200ResponseInner&gt;**](AdminRevenueGet200ResponseInner.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Revenue data |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminsdkupdatepost"></a>
# **AdminSdkUpdatePost**
> void AdminSdkUpdatePost (AdminSdkUpdatePostRequest adminSdkUpdatePostRequest = null)

Send SDK update notification to users


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **adminSdkUpdatePostRequest** | [**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md) |  | [optional]  |

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
| **200** | Notification sent |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminstatsget"></a>
# **AdminStatsGet**
> SystemStats AdminStatsGet ()

System-wide statistics (admin)


### Parameters
This endpoint does not need any parameter.
### Return type

[**SystemStats**](SystemStats.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | System stats |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersget"></a>
# **AdminUsersGet**
> PaginatedUsers AdminUsersGet (int page = null, int perPage = null)

List all users (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **page** | **int** |  | [optional]  |
| **perPage** | **int** |  | [optional]  |

### Return type

[**PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Paginated user list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersidget"></a>
# **AdminUsersIdGet**
> void AdminUsersIdGet (Guid id)

Get user details (admin)


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
| **200** | User details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersidplanput"></a>
# **AdminUsersIdPlanPut**
> void AdminUsersIdPlanPut (Guid id, AdminUsersIdPlanPutRequest adminUsersIdPlanPutRequest)

Change user plan (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **adminUsersIdPlanPutRequest** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md) |  |  |

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
| **200** | Plan changed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="adminusersidstatusput"></a>
# **AdminUsersIdStatusPut**
> void AdminUsersIdStatusPut (Guid id, AdminUsersIdStatusPutRequest adminUsersIdStatusPutRequest)

Change user status (admin)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **adminUsersIdStatusPutRequest** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md) |  |  |

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
| **200** | Status changed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

