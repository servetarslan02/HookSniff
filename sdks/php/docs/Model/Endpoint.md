# Endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  |
**url** | **string** |  |
**description** | **string** |  | [optional]
**is_active** | **bool** |  |
**retry_policy** | [**\OpenAPI\Client\Model\RetryPolicy**](RetryPolicy.md) |  |
**created_at** | **\DateTime** |  |
**allowed_ips** | **string[]** | CIDR blocks or exact IPs | [optional]
**event_filter** | **string[]** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional]
**custom_headers** | **object** |  | [optional]
**routing_strategy** | **string** |  |
**fallback_url** | **string** |  | [optional]
**avg_response_ms** | **int** |  |
**failure_streak** | **int** |  |
**format** | **string** |  |

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
