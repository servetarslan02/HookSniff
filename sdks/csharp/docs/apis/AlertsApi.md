# hooksniff.Api.AlertsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**AlertsGet**](AlertsApi.md#alertsget) | **GET** /alerts | List alert rules |
| [**AlertsIdDelete**](AlertsApi.md#alertsiddelete) | **DELETE** /alerts/{id} | Delete alert rule |
| [**AlertsIdGet**](AlertsApi.md#alertsidget) | **GET** /alerts/{id} | Get alert rule |
| [**AlertsIdTestPost**](AlertsApi.md#alertsidtestpost) | **POST** /alerts/{id}/test | Test an alert rule |
| [**AlertsPost**](AlertsApi.md#alertspost) | **POST** /alerts | Create alert rule |

<a id="alertsget"></a>
# **AlertsGet**
> List&lt;AlertRule&gt; AlertsGet ()

List alert rules


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;AlertRule&gt;**](AlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Alert list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="alertsiddelete"></a>
# **AlertsIdDelete**
> void AlertsIdDelete (Guid id)

Delete alert rule


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
| **200** | Alert deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="alertsidget"></a>
# **AlertsIdGet**
> AlertRule AlertsIdGet (Guid id)

Get alert rule


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**AlertRule**](AlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Alert details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="alertsidtestpost"></a>
# **AlertsIdTestPost**
> void AlertsIdTestPost (Guid id)

Test an alert rule


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
| **200** | Test notification sent |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="alertspost"></a>
# **AlertsPost**
> AlertRule AlertsPost (CreateAlertRequest createAlertRequest)

Create alert rule


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **createAlertRequest** | [**CreateAlertRequest**](CreateAlertRequest.md) |  |  |

### Return type

[**AlertRule**](AlertRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Alert created |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

