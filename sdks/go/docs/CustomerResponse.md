# CustomerResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Email** | **string** |  | 
**Name** | Pointer to **NullableString** |  | [optional] 
**ApiKey** | Pointer to **NullableString** | Only returned on registration | [optional] 
**Plan** | **string** |  | 
**WebhookLimit** | **int32** |  | 
**WebhookCount** | **int32** |  | 
**IsAdmin** | **bool** |  | 
**CreatedAt** | **time.Time** |  | 

## Methods

### NewCustomerResponse

`func NewCustomerResponse(id string, email string, plan string, webhookLimit int32, webhookCount int32, isAdmin bool, createdAt time.Time, ) *CustomerResponse`

NewCustomerResponse instantiates a new CustomerResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCustomerResponseWithDefaults

`func NewCustomerResponseWithDefaults() *CustomerResponse`

NewCustomerResponseWithDefaults instantiates a new CustomerResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *CustomerResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *CustomerResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *CustomerResponse) SetId(v string)`

SetId sets Id field to given value.


### GetEmail

`func (o *CustomerResponse) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *CustomerResponse) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *CustomerResponse) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetName

`func (o *CustomerResponse) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CustomerResponse) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CustomerResponse) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *CustomerResponse) HasName() bool`

HasName returns a boolean if a field has been set.

### SetNameNil

`func (o *CustomerResponse) SetNameNil(b bool)`

 SetNameNil sets the value for Name to be an explicit nil

### UnsetName
`func (o *CustomerResponse) UnsetName()`

UnsetName ensures that no value is present for Name, not even an explicit nil
### GetApiKey

`func (o *CustomerResponse) GetApiKey() string`

GetApiKey returns the ApiKey field if non-nil, zero value otherwise.

### GetApiKeyOk

`func (o *CustomerResponse) GetApiKeyOk() (*string, bool)`

GetApiKeyOk returns a tuple with the ApiKey field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetApiKey

`func (o *CustomerResponse) SetApiKey(v string)`

SetApiKey sets ApiKey field to given value.

### HasApiKey

`func (o *CustomerResponse) HasApiKey() bool`

HasApiKey returns a boolean if a field has been set.

### SetApiKeyNil

`func (o *CustomerResponse) SetApiKeyNil(b bool)`

 SetApiKeyNil sets the value for ApiKey to be an explicit nil

### UnsetApiKey
`func (o *CustomerResponse) UnsetApiKey()`

UnsetApiKey ensures that no value is present for ApiKey, not even an explicit nil
### GetPlan

`func (o *CustomerResponse) GetPlan() string`

GetPlan returns the Plan field if non-nil, zero value otherwise.

### GetPlanOk

`func (o *CustomerResponse) GetPlanOk() (*string, bool)`

GetPlanOk returns a tuple with the Plan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlan

`func (o *CustomerResponse) SetPlan(v string)`

SetPlan sets Plan field to given value.


### GetWebhookLimit

`func (o *CustomerResponse) GetWebhookLimit() int32`

GetWebhookLimit returns the WebhookLimit field if non-nil, zero value otherwise.

### GetWebhookLimitOk

`func (o *CustomerResponse) GetWebhookLimitOk() (*int32, bool)`

GetWebhookLimitOk returns a tuple with the WebhookLimit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookLimit

`func (o *CustomerResponse) SetWebhookLimit(v int32)`

SetWebhookLimit sets WebhookLimit field to given value.


### GetWebhookCount

`func (o *CustomerResponse) GetWebhookCount() int32`

GetWebhookCount returns the WebhookCount field if non-nil, zero value otherwise.

### GetWebhookCountOk

`func (o *CustomerResponse) GetWebhookCountOk() (*int32, bool)`

GetWebhookCountOk returns a tuple with the WebhookCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookCount

`func (o *CustomerResponse) SetWebhookCount(v int32)`

SetWebhookCount sets WebhookCount field to given value.


### GetIsAdmin

`func (o *CustomerResponse) GetIsAdmin() bool`

GetIsAdmin returns the IsAdmin field if non-nil, zero value otherwise.

### GetIsAdminOk

`func (o *CustomerResponse) GetIsAdminOk() (*bool, bool)`

GetIsAdminOk returns a tuple with the IsAdmin field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsAdmin

`func (o *CustomerResponse) SetIsAdmin(v bool)`

SetIsAdmin sets IsAdmin field to given value.


### GetCreatedAt

`func (o *CustomerResponse) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *CustomerResponse) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *CustomerResponse) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


