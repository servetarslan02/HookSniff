# hooksniff.Api.CustomerPortalApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**PortalApiKeysGet**](CustomerPortalApi.md#portalapikeysget) | **GET** /portal/api-keys | List API keys (portal) |
| [**PortalApiKeysKeyIdDelete**](CustomerPortalApi.md#portalapikeyskeyiddelete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal) |
| [**PortalApiKeysPost**](CustomerPortalApi.md#portalapikeyspost) | **POST** /portal/api-keys | Create API key (portal) |
| [**PortalConfigGet**](CustomerPortalApi.md#portalconfigget) | **GET** /portal/config | Get portal configuration |
| [**PortalConfigPost**](CustomerPortalApi.md#portalconfigpost) | **POST** /portal/config | Update portal configuration |
| [**PortalEmbedCodeGet**](CustomerPortalApi.md#portalembedcodeget) | **GET** /portal/embed-code | Get portal embed code |
| [**PortalMeGet**](CustomerPortalApi.md#portalmeget) | **GET** /portal/me | Get portal profile |
| [**PortalMePut**](CustomerPortalApi.md#portalmeput) | **PUT** /portal/me | Update portal profile |
| [**PortalNotificationsGet**](CustomerPortalApi.md#portalnotificationsget) | **GET** /portal/notifications | Get notification preferences (portal) |
| [**PortalNotificationsPut**](CustomerPortalApi.md#portalnotificationsput) | **PUT** /portal/notifications | Update notification preferences (portal) |
| [**PortalPlanGet**](CustomerPortalApi.md#portalplanget) | **GET** /portal/plan | Get plan info (portal) |
| [**PortalUsageGet**](CustomerPortalApi.md#portalusageget) | **GET** /portal/usage | Get usage (portal) |

<a id="portalapikeysget"></a>
# **PortalApiKeysGet**
> List&lt;ApiKeyInfo&gt; PortalApiKeysGet ()

List API keys (portal)


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;ApiKeyInfo&gt;**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | API key list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalapikeyskeyiddelete"></a>
# **PortalApiKeysKeyIdDelete**
> void PortalApiKeysKeyIdDelete (Guid keyId)

Revoke API key (portal)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **keyId** | **Guid** |  |  |

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
| **200** | Key revoked |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalapikeyspost"></a>
# **PortalApiKeysPost**
> CreateApiKeyResponse PortalApiKeysPost ()

Create API key (portal)


### Parameters
This endpoint does not need any parameter.
### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | API key created |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalconfigget"></a>
# **PortalConfigGet**
> void PortalConfigGet ()

Get portal configuration


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
| **200** | Portal config |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalconfigpost"></a>
# **PortalConfigPost**
> void PortalConfigPost ()

Update portal configuration


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
| **200** | Portal config saved |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalembedcodeget"></a>
# **PortalEmbedCodeGet**
> void PortalEmbedCodeGet ()

Get portal embed code


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
| **200** | Embed code snippet |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalmeget"></a>
# **PortalMeGet**
> PortalProfile PortalMeGet ()

Get portal profile


### Parameters
This endpoint does not need any parameter.
### Return type

[**PortalProfile**](PortalProfile.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Profile |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalmeput"></a>
# **PortalMePut**
> void PortalMePut (UpdateProfileRequest updateProfileRequest)

Update portal profile


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  |  |

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
| **200** | Profile updated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalnotificationsget"></a>
# **PortalNotificationsGet**
> NotificationPreferences PortalNotificationsGet ()

Get notification preferences (portal)


### Parameters
This endpoint does not need any parameter.
### Return type

[**NotificationPreferences**](NotificationPreferences.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Notification preferences |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalnotificationsput"></a>
# **PortalNotificationsPut**
> PortalNotificationsPut200Response PortalNotificationsPut (UpdateNotificationPreferences updateNotificationPreferences)

Update notification preferences (portal)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **updateNotificationPreferences** | [**UpdateNotificationPreferences**](UpdateNotificationPreferences.md) |  |  |

### Return type

[**PortalNotificationsPut200Response**](PortalNotificationsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Preferences updated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalplanget"></a>
# **PortalPlanGet**
> SubscriptionResponse PortalPlanGet ()

Get plan info (portal)


### Parameters
This endpoint does not need any parameter.
### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Plan details |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="portalusageget"></a>
# **PortalUsageGet**
> UsageResponse PortalUsageGet ()

Get usage (portal)


### Parameters
This endpoint does not need any parameter.
### Return type

[**UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Usage data |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

