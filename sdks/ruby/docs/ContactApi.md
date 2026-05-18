# OpenapiClient::ContactApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**contact_post**](ContactApi.md#contact_post) | **POST** /contact | Send contact form message |


## contact_post

> <ContactResponse> contact_post(contact_request)

Send contact form message

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::ContactApi.new
contact_request = OpenapiClient::ContactRequest.new({name: 'name_example', email: 'email_example', subject: 'subject_example', message: 'message_example'}) # ContactRequest | 

begin
  # Send contact form message
  result = api_instance.contact_post(contact_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling ContactApi->contact_post: #{e}"
end
```

#### Using the contact_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<ContactResponse>, Integer, Hash)> contact_post_with_http_info(contact_request)

```ruby
begin
  # Send contact form message
  data, status_code, headers = api_instance.contact_post_with_http_info(contact_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <ContactResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling ContactApi->contact_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **contact_request** | [**ContactRequest**](ContactRequest.md) |  |  |

### Return type

[**ContactResponse**](ContactResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

