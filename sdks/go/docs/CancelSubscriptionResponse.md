# CancelSubscriptionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CancelledAt** | **time.Time** |  | 
**EndsAt** | **time.Time** |  | 

## Methods

### NewCancelSubscriptionResponse

`func NewCancelSubscriptionResponse(cancelledAt time.Time, endsAt time.Time, ) *CancelSubscriptionResponse`

NewCancelSubscriptionResponse instantiates a new CancelSubscriptionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCancelSubscriptionResponseWithDefaults

`func NewCancelSubscriptionResponseWithDefaults() *CancelSubscriptionResponse`

NewCancelSubscriptionResponseWithDefaults instantiates a new CancelSubscriptionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCancelledAt

`func (o *CancelSubscriptionResponse) GetCancelledAt() time.Time`

GetCancelledAt returns the CancelledAt field if non-nil, zero value otherwise.

### GetCancelledAtOk

`func (o *CancelSubscriptionResponse) GetCancelledAtOk() (*time.Time, bool)`

GetCancelledAtOk returns a tuple with the CancelledAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCancelledAt

`func (o *CancelSubscriptionResponse) SetCancelledAt(v time.Time)`

SetCancelledAt sets CancelledAt field to given value.


### GetEndsAt

`func (o *CancelSubscriptionResponse) GetEndsAt() time.Time`

GetEndsAt returns the EndsAt field if non-nil, zero value otherwise.

### GetEndsAtOk

`func (o *CancelSubscriptionResponse) GetEndsAtOk() (*time.Time, bool)`

GetEndsAtOk returns a tuple with the EndsAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndsAt

`func (o *CancelSubscriptionResponse) SetEndsAt(v time.Time)`

SetEndsAt sets EndsAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


