# WebhooksAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**webhooksBatchPost**](WebhooksAPI.md#webhooksbatchpost) | **POST** /webhooks/batch | Send multiple webhooks in batch
[**webhooksBatchReplayPost**](WebhooksAPI.md#webhooksbatchreplaypost) | **POST** /webhooks/batch/replay | Replay multiple deliveries by ID
[**webhooksExportGet**](WebhooksAPI.md#webhooksexportget) | **GET** /webhooks/export | Export deliveries as CSV
[**webhooksGet**](WebhooksAPI.md#webhooksget) | **GET** /webhooks | List webhook deliveries
[**webhooksIdAttemptsGet**](WebhooksAPI.md#webhooksidattemptsget) | **GET** /webhooks/{id}/attempts | Get delivery attempts
[**webhooksIdGet**](WebhooksAPI.md#webhooksidget) | **GET** /webhooks/{id} | Get delivery by ID
[**webhooksIdReplayPost**](WebhooksAPI.md#webhooksidreplaypost) | **POST** /webhooks/{id}/replay | Replay a single delivery
[**webhooksPost**](WebhooksAPI.md#webhookspost) | **POST** /webhooks | Send a webhook


# **webhooksBatchPost**
```swift
    open class func webhooksBatchPost(batchWebhookRequest: BatchWebhookRequest, completion: @escaping (_ data: BatchResponse?, _ error: Error?) -> Void)
```

Send multiple webhooks in batch

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let batchWebhookRequest = BatchWebhookRequest(webhooks: [CreateWebhookRequest(endpointId: 123, event: "event_example", data: 123)]) // BatchWebhookRequest | 

// Send multiple webhooks in batch
WebhooksAPI.webhooksBatchPost(batchWebhookRequest: batchWebhookRequest) { (response, error) in
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
 **batchWebhookRequest** | [**BatchWebhookRequest**](BatchWebhookRequest.md) |  | 

### Return type

[**BatchResponse**](BatchResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooksBatchReplayPost**
```swift
    open class func webhooksBatchReplayPost(batchReplayRequest: BatchReplayRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Replay multiple deliveries by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let batchReplayRequest = BatchReplayRequest(ids: [123]) // BatchReplayRequest | 

// Replay multiple deliveries by ID
WebhooksAPI.webhooksBatchReplayPost(batchReplayRequest: batchReplayRequest) { (response, error) in
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
 **batchReplayRequest** | [**BatchReplayRequest**](BatchReplayRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooksExportGet**
```swift
    open class func webhooksExportGet(range: ModelRange_webhooksExportGet? = nil, completion: @escaping (_ data: String?, _ error: Error?) -> Void)
```

Export deliveries as CSV

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let range = "range_example" // String |  (optional) (default to ._7d)

// Export deliveries as CSV
WebhooksAPI.webhooksExportGet(range: range) { (response, error) in
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
 **range** | **String** |  | [optional] [default to ._7d]

### Return type

**String**

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: text/csv

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooksGet**
```swift
    open class func webhooksGet(page: Int? = nil, perPage: Int? = nil, status: Status_webhooksGet? = nil, endpointId: UUID? = nil, completion: @escaping (_ data: DeliveryListResponse?, _ error: Error?) -> Void)
```

List webhook deliveries

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let page = 987 // Int |  (optional) (default to 1)
let perPage = 987 // Int |  (optional) (default to 20)
let status = "status_example" // String |  (optional)
let endpointId = 987 // UUID |  (optional)

// List webhook deliveries
WebhooksAPI.webhooksGet(page: page, perPage: perPage, status: status, endpointId: endpointId) { (response, error) in
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
 **page** | **Int** |  | [optional] [default to 1]
 **perPage** | **Int** |  | [optional] [default to 20]
 **status** | **String** |  | [optional] 
 **endpointId** | **UUID** |  | [optional] 

### Return type

[**DeliveryListResponse**](DeliveryListResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooksIdAttemptsGet**
```swift
    open class func webhooksIdAttemptsGet(id: UUID, completion: @escaping (_ data: [DeliveryAttempt]?, _ error: Error?) -> Void)
```

Get delivery attempts

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get delivery attempts
WebhooksAPI.webhooksIdAttemptsGet(id: id) { (response, error) in
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
 **id** | **UUID** |  | 

### Return type

[**[DeliveryAttempt]**](DeliveryAttempt.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooksIdGet**
```swift
    open class func webhooksIdGet(id: UUID, completion: @escaping (_ data: Delivery?, _ error: Error?) -> Void)
```

Get delivery by ID

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get delivery by ID
WebhooksAPI.webhooksIdGet(id: id) { (response, error) in
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
 **id** | **UUID** |  | 

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooksIdReplayPost**
```swift
    open class func webhooksIdReplayPost(id: UUID, completion: @escaping (_ data: Delivery?, _ error: Error?) -> Void)
```

Replay a single delivery

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Replay a single delivery
WebhooksAPI.webhooksIdReplayPost(id: id) { (response, error) in
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
 **id** | **UUID** |  | 

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **webhooksPost**
```swift
    open class func webhooksPost(createWebhookRequest: CreateWebhookRequest, completion: @escaping (_ data: Delivery?, _ error: Error?) -> Void)
```

Send a webhook

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let createWebhookRequest = CreateWebhookRequest(endpointId: 123, event: "event_example", data: 123) // CreateWebhookRequest | 

// Send a webhook
WebhooksAPI.webhooksPost(createWebhookRequest: createWebhookRequest) { (response, error) in
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
 **createWebhookRequest** | [**CreateWebhookRequest**](CreateWebhookRequest.md) |  | 

### Return type

[**Delivery**](Delivery.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

