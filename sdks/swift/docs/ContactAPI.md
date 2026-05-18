# ContactAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**contactPost**](ContactAPI.md#contactpost) | **POST** /contact | Send contact form message


# **contactPost**
```swift
    open class func contactPost(contactRequest: ContactRequest, completion: @escaping (_ data: ContactResponse?, _ error: Error?) -> Void)
```

Send contact form message

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let contactRequest = ContactRequest(name: "name_example", email: "email_example", subject: "subject_example", message: "message_example") // ContactRequest | 

// Send contact form message
ContactAPI.contactPost(contactRequest: contactRequest) { (response, error) in
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
 **contactRequest** | [**ContactRequest**](ContactRequest.md) |  | 

### Return type

[**ContactResponse**](ContactResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

