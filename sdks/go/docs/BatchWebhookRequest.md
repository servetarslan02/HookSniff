# BatchWebhookRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Webhooks** | [**[]CreateWebhookRequest**](CreateWebhookRequest.md) |  | 

## Methods

### NewBatchWebhookRequest

`func NewBatchWebhookRequest(webhooks []CreateWebhookRequest, ) *BatchWebhookRequest`

NewBatchWebhookRequest instantiates a new BatchWebhookRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewBatchWebhookRequestWithDefaults

`func NewBatchWebhookRequestWithDefaults() *BatchWebhookRequest`

NewBatchWebhookRequestWithDefaults instantiates a new BatchWebhookRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetWebhooks

`func (o *BatchWebhookRequest) GetWebhooks() []CreateWebhookRequest`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *BatchWebhookRequest) GetWebhooksOk() (*[]CreateWebhookRequest, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *BatchWebhookRequest) SetWebhooks(v []CreateWebhookRequest)`

SetWebhooks sets Webhooks field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


