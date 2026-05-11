# OpenapiClient::EmbedApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**embed_get**](EmbedApi.md#embed_get) | **GET** /embed | Embeddable portal HTML |
| [**embed_script_get**](EmbedApi.md#embed_script_get) | **GET** /embed/script | Embeddable portal JavaScript |


## embed_get

> embed_get

Embeddable portal HTML

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EmbedApi.new

begin
  # Embeddable portal HTML
  api_instance.embed_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling EmbedApi->embed_get: #{e}"
end
```

#### Using the embed_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> embed_get_with_http_info

```ruby
begin
  # Embeddable portal HTML
  data, status_code, headers = api_instance.embed_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling EmbedApi->embed_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## embed_script_get

> embed_script_get

Embeddable portal JavaScript

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::EmbedApi.new

begin
  # Embeddable portal JavaScript
  api_instance.embed_script_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling EmbedApi->embed_script_get: #{e}"
end
```

#### Using the embed_script_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> embed_script_get_with_http_info

```ruby
begin
  # Embeddable portal JavaScript
  data, status_code, headers = api_instance.embed_script_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling EmbedApi->embed_script_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

