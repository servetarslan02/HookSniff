# CreateRoutingRuleRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** |  | 
**conditions** | **serde_json::Value** | Conditions that trigger this rule (e.g. event_type, header match) | 
**transform** | Option<**serde_json::Value**> | Optional payload transformation config | [optional]
**target_endpoint_id** | **uuid::Uuid** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


