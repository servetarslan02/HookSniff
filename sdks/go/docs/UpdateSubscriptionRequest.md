# UpdateSubscriptionRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Plan** | **string** | Target plan name | 
**Proration** | Pointer to **bool** | Whether to prorate charges for the current billing period | [optional] [default to true]

## Methods

### NewUpdateSubscriptionRequest

`func NewUpdateSubscriptionRequest(plan string, ) *UpdateSubscriptionRequest`

NewUpdateSubscriptionRequest instantiates a new UpdateSubscriptionRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateSubscriptionRequestWithDefaults

`func NewUpdateSubscriptionRequestWithDefaults() *UpdateSubscriptionRequest`

NewUpdateSubscriptionRequestWithDefaults instantiates a new UpdateSubscriptionRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPlan

`func (o *UpdateSubscriptionRequest) GetPlan() string`

GetPlan returns the Plan field if non-nil, zero value otherwise.

### GetPlanOk

`func (o *UpdateSubscriptionRequest) GetPlanOk() (*string, bool)`

GetPlanOk returns a tuple with the Plan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlan

`func (o *UpdateSubscriptionRequest) SetPlan(v string)`

SetPlan sets Plan field to given value.


### GetProration

`func (o *UpdateSubscriptionRequest) GetProration() bool`

GetProration returns the Proration field if non-nil, zero value otherwise.

### GetProrationOk

`func (o *UpdateSubscriptionRequest) GetProrationOk() (*bool, bool)`

GetProrationOk returns a tuple with the Proration field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProration

`func (o *UpdateSubscriptionRequest) SetProration(v bool)`

SetProration sets Proration field to given value.

### HasProration

`func (o *UpdateSubscriptionRequest) HasProration() bool`

HasProration returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


