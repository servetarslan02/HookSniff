# CustomDomain

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | 
**domain** | **String** | The custom domain (e.g. webhooks.example.com) | 
**status** | **Status** |  (enum: pending, verifying, verified, failed) | 
**verification_token** | Option<**String**> | TXT record value to prove domain ownership | [optional]
**created_at** | **chrono::DateTime<chrono::FixedOffset>** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


