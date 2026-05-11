# \AdminApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**admin_revenue_get**](AdminApi.md#admin_revenue_get) | **GET** /admin/revenue | Revenue by month (admin)
[**admin_sdk_update_post**](AdminApi.md#admin_sdk_update_post) | **POST** /admin/sdk-update | Send SDK update notification to users
[**admin_stats_get**](AdminApi.md#admin_stats_get) | **GET** /admin/stats | System-wide statistics (admin)
[**admin_users_get**](AdminApi.md#admin_users_get) | **GET** /admin/users | List all users (admin)
[**admin_users_id_get**](AdminApi.md#admin_users_id_get) | **GET** /admin/users/{id} | Get user details (admin)
[**admin_users_id_plan_put**](AdminApi.md#admin_users_id_plan_put) | **PUT** /admin/users/{id}/plan | Change user plan (admin)
[**admin_users_id_status_put**](AdminApi.md#admin_users_id_status_put) | **PUT** /admin/users/{id}/status | Change user status (admin)



## admin_revenue_get

> Vec<models::AdminRevenueGet200ResponseInner> admin_revenue_get()
Revenue by month (admin)

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::AdminRevenueGet200ResponseInner>**](_admin_revenue_get_200_response_inner.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_sdk_update_post

> admin_sdk_update_post(admin_sdk_update_post_request)
Send SDK update notification to users

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**admin_sdk_update_post_request** | Option<[**AdminSdkUpdatePostRequest**](AdminSdkUpdatePostRequest.md)> |  |  |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_stats_get

> models::SystemStats admin_stats_get()
System-wide statistics (admin)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::SystemStats**](SystemStats.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_get

> models::PaginatedUsers admin_users_get(page, per_page)
List all users (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**page** | Option<**i32**> |  |  |
**per_page** | Option<**i32**> |  |  |

### Return type

[**models::PaginatedUsers**](PaginatedUsers.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_id_get

> admin_users_id_get(id)
Get user details (admin)

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


## admin_users_id_plan_put

> admin_users_id_plan_put(id, admin_users_id_plan_put_request)
Change user plan (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**admin_users_id_plan_put_request** | [**AdminUsersIdPlanPutRequest**](AdminUsersIdPlanPutRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## admin_users_id_status_put

> admin_users_id_status_put(id, admin_users_id_status_put_request)
Change user status (admin)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**admin_users_id_status_put_request** | [**AdminUsersIdStatusPutRequest**](AdminUsersIdStatusPutRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

