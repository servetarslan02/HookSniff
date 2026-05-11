# OpenapiClient::SearchApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**search_get**](SearchApi.md#search_get) | **GET** /search | Search deliveries |


## search_get

> <SearchResult> search_get(q, opts)

Search deliveries

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::SearchApi.new
q = 'q_example' # String | 
opts = {
  status: 'status_example', # String | 
  endpoint_id: '38400000-8cf0-11bd-b23e-10b96e4ef00d', # String | 
  page: 56, # Integer | 
  per_page: 56 # Integer | 
}

begin
  # Search deliveries
  result = api_instance.search_get(q, opts)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling SearchApi->search_get: #{e}"
end
```

#### Using the search_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<SearchResult>, Integer, Hash)> search_get_with_http_info(q, opts)

```ruby
begin
  # Search deliveries
  data, status_code, headers = api_instance.search_get_with_http_info(q, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <SearchResult>
rescue OpenapiClient::ApiError => e
  puts "Error when calling SearchApi->search_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **q** | **String** |  |  |
| **status** | **String** |  | [optional] |
| **endpoint_id** | **String** |  | [optional] |
| **page** | **Integer** |  | [optional] |
| **per_page** | **Integer** |  | [optional] |

### Return type

[**SearchResult**](SearchResult.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

