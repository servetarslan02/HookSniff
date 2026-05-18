# CreateAlertRuleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | Human-readable alert name | 
**condition** | **Condition** | Condition that triggers the alert (enum: failure_rate, latency, consecutive_failures) | 
**threshold** | **i32** | Threshold value for the condition | 
**channels** | **Vec<Channels>** | Notification channels to alert on (enum: slack, email, webhook) | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


