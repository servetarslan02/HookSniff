# HookSniff::OAuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**oauth_google_callback_get**](OAuthApi.md#oauth_google_callback_get) | **GET** /oauth/google/callback | Google OAuth callback |
| [**oauth_google_get**](OAuthApi.md#oauth_google_get) | **GET** /oauth/google | Google OAuth login redirect |
| [**oauth_providers_get**](OAuthApi.md#oauth_providers_get) | **GET** /oauth/providers | List available OAuth providers |


## oauth_google_callback_get

> oauth_google_callback_get

Google OAuth callback

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::OAuthApi.new

begin
  # Google OAuth callback
  api_instance.oauth_google_callback_get
rescue HookSniff::ApiError => e
  puts "Error when calling OAuthApi->oauth_google_callback_get: #{e}"
end
```

#### Using the oauth_google_callback_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> oauth_google_callback_get_with_http_info

```ruby
begin
  # Google OAuth callback
  data, status_code, headers = api_instance.oauth_google_callback_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue HookSniff::ApiError => e
  puts "Error when calling OAuthApi->oauth_google_callback_get_with_http_info: #{e}"
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


## oauth_google_get

> oauth_google_get

Google OAuth login redirect

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::OAuthApi.new

begin
  # Google OAuth login redirect
  api_instance.oauth_google_get
rescue HookSniff::ApiError => e
  puts "Error when calling OAuthApi->oauth_google_get: #{e}"
end
```

#### Using the oauth_google_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> oauth_google_get_with_http_info

```ruby
begin
  # Google OAuth login redirect
  data, status_code, headers = api_instance.oauth_google_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue HookSniff::ApiError => e
  puts "Error when calling OAuthApi->oauth_google_get_with_http_info: #{e}"
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


## oauth_providers_get

> oauth_providers_get

List available OAuth providers

### Examples

```ruby
require 'time'
require 'hooksniff'
# setup authorization
HookSniff.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = HookSniff::OAuthApi.new

begin
  # List available OAuth providers
  api_instance.oauth_providers_get
rescue HookSniff::ApiError => e
  puts "Error when calling OAuthApi->oauth_providers_get: #{e}"
end
```

#### Using the oauth_providers_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> oauth_providers_get_with_http_info

```ruby
begin
  # List available OAuth providers
  data, status_code, headers = api_instance.oauth_providers_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue HookSniff::ApiError => e
  puts "Error when calling OAuthApi->oauth_providers_get_with_http_info: #{e}"
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

