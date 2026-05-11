# SearchAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**searchGet**](SearchAPI.md#searchget) | **GET** /search | Search deliveries


# **searchGet**
```swift
    open class func searchGet(q: String, status: String? = nil, endpointId: UUID? = nil, page: Int? = nil, perPage: Int? = nil, completion: @escaping (_ data: SearchResult?, _ error: Error?) -> Void)
```

Search deliveries

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let q = "q_example" // String | 
let status = "status_example" // String |  (optional)
let endpointId = 987 // UUID |  (optional)
let page = 987 // Int |  (optional)
let perPage = 987 // Int |  (optional)

// Search deliveries
SearchAPI.searchGet(q: q, status: status, endpointId: endpointId, page: page, perPage: perPage) { (response, error) in
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
 **q** | **String** |  | 
 **status** | **String** |  | [optional] 
 **endpointId** | **UUID** |  | [optional] 
 **page** | **Int** |  | [optional] 
 **perPage** | **Int** |  | [optional] 

### Return type

[**SearchResult**](SearchResult.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

