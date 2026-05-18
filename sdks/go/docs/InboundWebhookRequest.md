# InboundWebhookRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Provider** | **string** | Provider name (e.g. stripe, github, shopify) | 
**Payload** | **map[string]interface{}** | Raw webhook payload body | 
**Headers** | Pointer to **map[string]interface{}** | HTTP headers from the incoming webhook request | [optional] 

## Methods

### NewInboundWebhookRequest

`func NewInboundWebhookRequest(provider string, payload map[string]interface{}, ) *InboundWebhookRequest`

NewInboundWebhookRequest instantiates a new InboundWebhookRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInboundWebhookRequestWithDefaults

`func NewInboundWebhookRequestWithDefaults() *InboundWebhookRequest`

NewInboundWebhookRequestWithDefaults instantiates a new InboundWebhookRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetProvider

`func (o *InboundWebhookRequest) GetProvider() string`

GetProvider returns the Provider field if non-nil, zero value otherwise.

### GetProviderOk

`func (o *InboundWebhookRequest) GetProviderOk() (*string, bool)`

GetProviderOk returns a tuple with the Provider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProvider

`func (o *InboundWebhookRequest) SetProvider(v string)`

SetProvider sets Provider field to given value.


### GetPayload

`func (o *InboundWebhookRequest) GetPayload() map[string]interface{}`

GetPayload returns the Payload field if non-nil, zero value otherwise.

### GetPayloadOk

`func (o *InboundWebhookRequest) GetPayloadOk() (*map[string]interface{}, bool)`

GetPayloadOk returns a tuple with the Payload field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayload

`func (o *InboundWebhookRequest) SetPayload(v map[string]interface{})`

SetPayload sets Payload field to given value.


### GetHeaders

`func (o *InboundWebhookRequest) GetHeaders() map[string]interface{}`

GetHeaders returns the Headers field if non-nil, zero value otherwise.

### GetHeadersOk

`func (o *InboundWebhookRequest) GetHeadersOk() (*map[string]interface{}, bool)`

GetHeadersOk returns a tuple with the Headers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHeaders

`func (o *InboundWebhookRequest) SetHeaders(v map[string]interface{})`

SetHeaders sets Headers field to given value.

### HasHeaders

`func (o *InboundWebhookRequest) HasHeaders() bool`

HasHeaders returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


