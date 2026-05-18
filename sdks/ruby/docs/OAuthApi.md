# OpenapiClient::OAuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**oauth_github_callback_get**](OAuthApi.md#oauth_github_callback_get) | **GET** /oauth/github/callback | GitHub OAuth callback |
| [**oauth_github_get**](OAuthApi.md#oauth_github_get) | **GET** /oauth/github | GitHub OAuth login redirect |
| [**oauth_google_callback_get**](OAuthApi.md#oauth_google_callback_get) | **GET** /oauth/google/callback | Google OAuth callback |
| [**oauth_google_get**](OAuthApi.md#oauth_google_get) | **GET** /oauth/google | Google OAuth login redirect |
| [**oauth_providers_get**](OAuthApi.md#oauth_providers_get) | **GET** /oauth/providers | List available OAuth providers |


## oauth_github_callback_get

> oauth_github_callback_get(code, state, opts)

GitHub OAuth callback

Handles GitHub OAuth callback, creates/links account, sets auth cookies

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::OAuthApi.new
code = 'code_example' # String | Authorization code from GitHub
state = 'state_example' # String | CSRF state token (verified against cookie)
opts = {
  error: 'error_example' # String | Error from GitHub (e.g. access_denied)
}

begin
  # GitHub OAuth callback
  api_instance.oauth_github_callback_get(code, state, opts)
rescue OpenapiClient::ApiError => e
  puts "Error when calling OAuthApi->oauth_github_callback_get: #{e}"
end
```

#### Using the oauth_github_callback_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> oauth_github_callback_get_with_http_info(code, state, opts)

```ruby
begin
  # GitHub OAuth callback
  data, status_code, headers = api_instance.oauth_github_callback_get_with_http_info(code, state, opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling OAuthApi->oauth_github_callback_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **code** | **String** | Authorization code from GitHub |  |
| **state** | **String** | CSRF state token (verified against cookie) |  |
| **error** | **String** | Error from GitHub (e.g. access_denied) | [optional] |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## oauth_github_get

> oauth_github_get

GitHub OAuth login redirect

Redirects to GitHub OAuth consent screen with CSRF state cookie

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::OAuthApi.new

begin
  # GitHub OAuth login redirect
  api_instance.oauth_github_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling OAuthApi->oauth_github_get: #{e}"
end
```

#### Using the oauth_github_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> oauth_github_get_with_http_info

```ruby
begin
  # GitHub OAuth login redirect
  data, status_code, headers = api_instance.oauth_github_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling OAuthApi->oauth_github_get_with_http_info: #{e}"
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


## oauth_google_callback_get

> oauth_google_callback_get

Google OAuth callback

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::OAuthApi.new

begin
  # Google OAuth callback
  api_instance.oauth_google_callback_get
rescue OpenapiClient::ApiError => e
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
rescue OpenapiClient::ApiError => e
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
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::OAuthApi.new

begin
  # Google OAuth login redirect
  api_instance.oauth_google_get
rescue OpenapiClient::ApiError => e
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
rescue OpenapiClient::ApiError => e
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
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::OAuthApi.new

begin
  # List available OAuth providers
  api_instance.oauth_providers_get
rescue OpenapiClient::ApiError => e
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
rescue OpenapiClient::ApiError => e
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

