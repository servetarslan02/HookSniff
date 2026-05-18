# CustomerPortalAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**portalApiKeysGet**](CustomerPortalAPI.md#portalapikeysget) | **GET** /portal/api-keys | List API keys (portal)
[**portalApiKeysKeyIdDelete**](CustomerPortalAPI.md#portalapikeyskeyiddelete) | **DELETE** /portal/api-keys/{key_id} | Revoke API key (portal)
[**portalApiKeysPost**](CustomerPortalAPI.md#portalapikeyspost) | **POST** /portal/api-keys | Create API key (portal)
[**portalConfigGet**](CustomerPortalAPI.md#portalconfigget) | **GET** /portal/config | Get portal configuration
[**portalConfigPost**](CustomerPortalAPI.md#portalconfigpost) | **POST** /portal/config | Update portal configuration
[**portalEmbedCodeGet**](CustomerPortalAPI.md#portalembedcodeget) | **GET** /portal/embed-code | Get portal embed code
[**portalMeGet**](CustomerPortalAPI.md#portalmeget) | **GET** /portal/me | Get portal profile
[**portalMePut**](CustomerPortalAPI.md#portalmeput) | **PUT** /portal/me | Update portal profile
[**portalNotificationsGet**](CustomerPortalAPI.md#portalnotificationsget) | **GET** /portal/notifications | Get notification preferences (portal)
[**portalNotificationsPut**](CustomerPortalAPI.md#portalnotificationsput) | **PUT** /portal/notifications | Update notification preferences (portal)
[**portalPlanGet**](CustomerPortalAPI.md#portalplanget) | **GET** /portal/plan | Get plan info (portal)
[**portalUsageGet**](CustomerPortalAPI.md#portalusageget) | **GET** /portal/usage | Get usage (portal)


# **portalApiKeysGet**
```swift
    open class func portalApiKeysGet(completion: @escaping (_ data: [ApiKeyInfo]?, _ error: Error?) -> Void)
```

List API keys (portal)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List API keys (portal)
CustomerPortalAPI.portalApiKeysGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**[ApiKeyInfo]**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalApiKeysKeyIdDelete**
```swift
    open class func portalApiKeysKeyIdDelete(keyId: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Revoke API key (portal)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let keyId = 987 // UUID | 

// Revoke API key (portal)
CustomerPortalAPI.portalApiKeysKeyIdDelete(keyId: keyId) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **keyId** | **UUID** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalApiKeysPost**
```swift
    open class func portalApiKeysPost(completion: @escaping (_ data: CreateApiKeyResponse?, _ error: Error?) -> Void)
```

Create API key (portal)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Create API key (portal)
CustomerPortalAPI.portalApiKeysPost() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalConfigGet**
```swift
    open class func portalConfigGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get portal configuration

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get portal configuration
CustomerPortalAPI.portalConfigGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalConfigPost**
```swift
    open class func portalConfigPost(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Update portal configuration

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Update portal configuration
CustomerPortalAPI.portalConfigPost() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalEmbedCodeGet**
```swift
    open class func portalEmbedCodeGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Get portal embed code

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get portal embed code
CustomerPortalAPI.portalEmbedCodeGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalMeGet**
```swift
    open class func portalMeGet(completion: @escaping (_ data: PortalProfile?, _ error: Error?) -> Void)
```

Get portal profile

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get portal profile
CustomerPortalAPI.portalMeGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**PortalProfile**](PortalProfile.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalMePut**
```swift
    open class func portalMePut(updateProfileRequest: UpdateProfileRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Update portal profile

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let updateProfileRequest = UpdateProfileRequest(name: "name_example", email: "email_example") // UpdateProfileRequest | 

// Update portal profile
CustomerPortalAPI.portalMePut(updateProfileRequest: updateProfileRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalNotificationsGet**
```swift
    open class func portalNotificationsGet(completion: @escaping (_ data: NotificationPreferences?, _ error: Error?) -> Void)
```

Get notification preferences (portal)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get notification preferences (portal)
CustomerPortalAPI.portalNotificationsGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**NotificationPreferences**](NotificationPreferences.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalNotificationsPut**
```swift
    open class func portalNotificationsPut(updateNotificationPreferences: UpdateNotificationPreferences, completion: @escaping (_ data: PortalNotificationsPut200Response?, _ error: Error?) -> Void)
```

Update notification preferences (portal)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let updateNotificationPreferences = UpdateNotificationPreferences(emailOnFailure: false, emailOnDeadLetter: false, emailOnSuccess: false, slackWebhookUrl: "slackWebhookUrl_example", discordWebhookUrl: "discordWebhookUrl_example", webhookUrl: "webhookUrl_example") // UpdateNotificationPreferences | 

// Update notification preferences (portal)
CustomerPortalAPI.portalNotificationsPut(updateNotificationPreferences: updateNotificationPreferences) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateNotificationPreferences** | [**UpdateNotificationPreferences**](UpdateNotificationPreferences.md) |  | 

### Return type

[**PortalNotificationsPut200Response**](PortalNotificationsPut200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalPlanGet**
```swift
    open class func portalPlanGet(completion: @escaping (_ data: SubscriptionResponse?, _ error: Error?) -> Void)
```

Get plan info (portal)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get plan info (portal)
CustomerPortalAPI.portalPlanGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**SubscriptionResponse**](SubscriptionResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portalUsageGet**
```swift
    open class func portalUsageGet(completion: @escaping (_ data: UsageResponse?, _ error: Error?) -> Void)
```

Get usage (portal)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get usage (portal)
CustomerPortalAPI.portalUsageGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**UsageResponse**](UsageResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

