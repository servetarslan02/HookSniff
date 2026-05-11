# RetryPolicy

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**max_attempts** | Option<**i32**> |  | [optional][default to 3]
**backoff** | Option<**Backoff**> |  (enum: exponential, linear, fixed) | [optional][default to Exponential]
**initial_delay_secs** | Option<**i32**> |  | [optional][default to 10]
**max_delay_secs** | Option<**i32**> |  | [optional][default to 3600]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


