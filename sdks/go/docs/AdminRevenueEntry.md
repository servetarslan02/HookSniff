# AdminRevenueEntry

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Date** | **string** |  | 
**Mrr** | **float64** | Monthly recurring revenue in dollars | 
**NewSubscriptions** | **int32** |  | 
**Churns** | **int32** |  | 

## Methods

### NewAdminRevenueEntry

`func NewAdminRevenueEntry(date string, mrr float64, newSubscriptions int32, churns int32, ) *AdminRevenueEntry`

NewAdminRevenueEntry instantiates a new AdminRevenueEntry object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminRevenueEntryWithDefaults

`func NewAdminRevenueEntryWithDefaults() *AdminRevenueEntry`

NewAdminRevenueEntryWithDefaults instantiates a new AdminRevenueEntry object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDate

`func (o *AdminRevenueEntry) GetDate() string`

GetDate returns the Date field if non-nil, zero value otherwise.

### GetDateOk

`func (o *AdminRevenueEntry) GetDateOk() (*string, bool)`

GetDateOk returns a tuple with the Date field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDate

`func (o *AdminRevenueEntry) SetDate(v string)`

SetDate sets Date field to given value.


### GetMrr

`func (o *AdminRevenueEntry) GetMrr() float64`

GetMrr returns the Mrr field if non-nil, zero value otherwise.

### GetMrrOk

`func (o *AdminRevenueEntry) GetMrrOk() (*float64, bool)`

GetMrrOk returns a tuple with the Mrr field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMrr

`func (o *AdminRevenueEntry) SetMrr(v float64)`

SetMrr sets Mrr field to given value.


### GetNewSubscriptions

`func (o *AdminRevenueEntry) GetNewSubscriptions() int32`

GetNewSubscriptions returns the NewSubscriptions field if non-nil, zero value otherwise.

### GetNewSubscriptionsOk

`func (o *AdminRevenueEntry) GetNewSubscriptionsOk() (*int32, bool)`

GetNewSubscriptionsOk returns a tuple with the NewSubscriptions field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNewSubscriptions

`func (o *AdminRevenueEntry) SetNewSubscriptions(v int32)`

SetNewSubscriptions sets NewSubscriptions field to given value.


### GetChurns

`func (o *AdminRevenueEntry) GetChurns() int32`

GetChurns returns the Churns field if non-nil, zero value otherwise.

### GetChurnsOk

`func (o *AdminRevenueEntry) GetChurnsOk() (*int32, bool)`

GetChurnsOk returns a tuple with the Churns field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChurns

`func (o *AdminRevenueEntry) SetChurns(v int32)`

SetChurns sets Churns field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


