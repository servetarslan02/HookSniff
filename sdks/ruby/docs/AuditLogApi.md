# OpenapiClient::AuditLogApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**audit_log_get**](AuditLogApi.md#audit_log_get) | **GET** /audit-log | List audit log entries |
| [**audit_log_id_get**](AuditLogApi.md#audit_log_id_get) | **GET** /audit-log/{id} | Get audit entry detail |


## audit_log_get

> audit_log_get(opts)

List audit log entries

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuditLogApi.new
opts = {
  page: 56, # Integer | 
  action: 'action_example' # String | 
}

begin
  # List audit log entries
  api_instance.audit_log_get(opts)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuditLogApi->audit_log_get: #{e}"
end
```

#### Using the audit_log_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> audit_log_get_with_http_info(opts)

```ruby
begin
  # List audit log entries
  data, status_code, headers = api_instance.audit_log_get_with_http_info(opts)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuditLogApi->audit_log_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **page** | **Integer** |  | [optional][default to 1] |
| **action** | **String** |  | [optional] |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## audit_log_id_get

> audit_log_id_get(id)

Get audit entry detail

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuditLogApi.new
id = 'id_example' # String | 

begin
  # Get audit entry detail
  api_instance.audit_log_id_get(id)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuditLogApi->audit_log_id_get: #{e}"
end
```

#### Using the audit_log_id_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> audit_log_id_get_with_http_info(id)

```ruby
begin
  # Get audit entry detail
  data, status_code, headers = api_instance.audit_log_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuditLogApi->audit_log_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

