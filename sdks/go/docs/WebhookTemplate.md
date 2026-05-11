# WebhookTemplate

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Name** | **string** |  | 
**Description** | **string** |  | 
**Category** | **string** |  | 
**PayloadTemplate** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewWebhookTemplate

`func NewWebhookTemplate(id string, name string, description string, category string, ) *WebhookTemplate`

NewWebhookTemplate instantiates a new WebhookTemplate object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWebhookTemplateWithDefaults

`func NewWebhookTemplateWithDefaults() *WebhookTemplate`

NewWebhookTemplateWithDefaults instantiates a new WebhookTemplate object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *WebhookTemplate) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *WebhookTemplate) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *WebhookTemplate) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *WebhookTemplate) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *WebhookTemplate) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *WebhookTemplate) SetName(v string)`

SetName sets Name field to given value.


### GetDescription

`func (o *WebhookTemplate) GetDescription() string`

GetDescription returns the Description field if non-nil, zero value otherwise.

### GetDescriptionOk

`func (o *WebhookTemplate) GetDescriptionOk() (*string, bool)`

GetDescriptionOk returns a tuple with the Description field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDescription

`func (o *WebhookTemplate) SetDescription(v string)`

SetDescription sets Description field to given value.


### GetCategory

`func (o *WebhookTemplate) GetCategory() string`

GetCategory returns the Category field if non-nil, zero value otherwise.

### GetCategoryOk

`func (o *WebhookTemplate) GetCategoryOk() (*string, bool)`

GetCategoryOk returns a tuple with the Category field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCategory

`func (o *WebhookTemplate) SetCategory(v string)`

SetCategory sets Category field to given value.


### GetPayloadTemplate

`func (o *WebhookTemplate) GetPayloadTemplate() map[string]interface{}`

GetPayloadTemplate returns the PayloadTemplate field if non-nil, zero value otherwise.

### GetPayloadTemplateOk

`func (o *WebhookTemplate) GetPayloadTemplateOk() (*map[string]interface{}, bool)`

GetPayloadTemplateOk returns a tuple with the PayloadTemplate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPayloadTemplate

`func (o *WebhookTemplate) SetPayloadTemplate(v map[string]interface{})`

SetPayloadTemplate sets PayloadTemplate field to given value.

### HasPayloadTemplate

`func (o *WebhookTemplate) HasPayloadTemplate() bool`

HasPayloadTemplate returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


