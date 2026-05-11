# OpenapiClient::OutboundIPsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**outbound_ips_get**](OutboundIPsApi.md#outbound_ips_get) | **GET** /outbound-ips | Get outbound IP addresses for firewall whitelisting |


## outbound_ips_get

> <OutboundIpsResponse> outbound_ips_get

Get outbound IP addresses for firewall whitelisting

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::OutboundIPsApi.new

begin
  # Get outbound IP addresses for firewall whitelisting
  result = api_instance.outbound_ips_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling OutboundIPsApi->outbound_ips_get: #{e}"
end
```

#### Using the outbound_ips_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<OutboundIpsResponse>, Integer, Hash)> outbound_ips_get_with_http_info

```ruby
begin
  # Get outbound IP addresses for firewall whitelisting
  data, status_code, headers = api_instance.outbound_ips_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <OutboundIpsResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling OutboundIPsApi->outbound_ips_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**OutboundIpsResponse**](OutboundIpsResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

