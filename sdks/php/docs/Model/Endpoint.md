# Endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional]
**url** | **string** |  | [optional]
**description** | **string** |  | [optional]
**is_active** | **bool** |  | [optional]
**retry_policy** | [**\OpenAPI\Client\Model\RetryPolicy**](RetryPolicy.md) |  | [optional]
**created_at** | **\DateTime** |  | [optional]
**allowed_ips** | **string[]** | CIDR blocks or exact IPs | [optional]
**event_filter** | **string[]** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional]
**custom_headers** | **object** |  | [optional]
**routing_strategy** | **string** |  | [optional]
**fallback_url** | **string** |  | [optional]
**avg_response_ms** | **int** |  | [optional]
**failure_streak** | **int** |  | [optional]
**format** | **string** |  | [optional]

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
