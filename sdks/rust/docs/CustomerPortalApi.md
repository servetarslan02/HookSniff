# \CustomerPortalApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**portal_api_keys_get**](CustomerPortalApi.md#portal_api_keys_get) | **GET** /portal/api-keys | List API keys (portal)
[**portal_api_keys_key_id_delete**](CustomerPortalApi.md#portal_api_keys_key_id_delete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal)
[**portal_api_keys_post**](CustomerPortalApi.md#portal_api_keys_post) | **POST** /portal/api-keys | Create API key (portal)
[**portal_config_get**](CustomerPortalApi.md#portal_config_get) | **GET** /portal/config | Get portal configuration
[**portal_config_post**](CustomerPortalApi.md#portal_config_post) | **POST** /portal/config | Update portal configuration
[**portal_embed_code_get**](CustomerPortalApi.md#portal_embed_code_get) | **GET** /portal/embed-code | Get portal embed code
[**portal_me_get**](CustomerPortalApi.md#portal_me_get) | **GET** /portal/me | Get portal profile
[**portal_me_put**](CustomerPortalApi.md#portal_me_put) | **PUT** /portal/me | Update portal profile
[**portal_notifications_get**](CustomerPortalApi.md#portal_notifications_get) | **GET** /portal/notifications | Get notification preferences (portal)
[**portal_notifications_put**](CustomerPortalApi.md#portal_notifications_put) | **PUT** /portal/notifications | Update notification preferences (portal)
[**portal_plan_get**](CustomerPortalApi.md#portal_plan_get) | **GET** /portal/plan | Get plan info (portal)
[**portal_usage_get**](CustomerPortalApi.md#portal_usage_get) | **GET** /portal/usage | Get usage (portal)



## portal_api_keys_get

> Vec<models::ApiKeyInfo> portal_api_keys_get()
List API keys (portal)

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::ApiKeyInfo>**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## portal_api_keys_key_id_delete

> portal_api_keys_key_id_delete(key_id)
Revoke API key (portal)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**key_id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## portal_api_keys_post

> models::CreateApiKeyResponse portal_api_keys_post()
Create API key (portal)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## portal_config_get

> portal_config_get()
Get portal configuration

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


## portal_config_post

> portal_config_post()
Update portal configuration

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


## portal_embed_code_get

> portal_embed_code_get()
Get portal embed code

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


## portal_me_get

> models::PortalProfile portal_me_get()
Get portal profile

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::PortalProfile**](PortalProfile.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## portal_me_put

> portal_me_put(update_profile_request)
Update portal profile

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**update_profile_request** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## portal_notifications_get

> models::NotificationPreferences portal_notifications_get()
Get notification preferences (portal)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::NotificationPreferences**](NotificationPreferences.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## portal_notifications_put

> models::PortalNotificationsPut200Response portal_notifications_put(update_notification_preferences)
Update notification preferences (portal)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**update_notification_preferences** | [**UpdateNotificationPreferences**](UpdateNotificationPreferences.md) |  | [required] |

### Return type

[**models::PortalNotificationsPut200Response**](_portal_notifications_put_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## portal_plan_get

> models::SubscriptionResponse portal_plan_get()
Get plan info (portal)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## portal_usage_get

> models::UsageResponse portal_usage_get()
Get usage (portal)

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

