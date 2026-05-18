# ChurnedUser

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Email** | **string** |  | 
**Name** | Pointer to **NullableString** |  | [optional] 
**Plan** | **string** |  | 
**Amount** | **float64** |  | 
**ChurnDate** | **time.Time** |  | 

## Methods

### NewChurnedUser

`func NewChurnedUser(id string, email string, plan string, amount float64, churnDate time.Time, ) *ChurnedUser`

NewChurnedUser instantiates a new ChurnedUser object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewChurnedUserWithDefaults

`func NewChurnedUserWithDefaults() *ChurnedUser`

NewChurnedUserWithDefaults instantiates a new ChurnedUser object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *ChurnedUser) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ChurnedUser) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ChurnedUser) SetId(v string)`

SetId sets Id field to given value.


### GetEmail

`func (o *ChurnedUser) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *ChurnedUser) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *ChurnedUser) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetName

`func (o *ChurnedUser) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *ChurnedUser) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *ChurnedUser) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *ChurnedUser) HasName() bool`

HasName returns a boolean if a field has been set.

### SetNameNil

`func (o *ChurnedUser) SetNameNil(b bool)`

 SetNameNil sets the value for Name to be an explicit nil

### UnsetName
`func (o *ChurnedUser) UnsetName()`

UnsetName ensures that no value is present for Name, not even an explicit nil
### GetPlan

`func (o *ChurnedUser) GetPlan() string`

GetPlan returns the Plan field if non-nil, zero value otherwise.

### GetPlanOk

`func (o *ChurnedUser) GetPlanOk() (*string, bool)`

GetPlanOk returns a tuple with the Plan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlan

`func (o *ChurnedUser) SetPlan(v string)`

SetPlan sets Plan field to given value.


### GetAmount

`func (o *ChurnedUser) GetAmount() float64`

GetAmount returns the Amount field if non-nil, zero value otherwise.

### GetAmountOk

`func (o *ChurnedUser) GetAmountOk() (*float64, bool)`

GetAmountOk returns a tuple with the Amount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAmount

`func (o *ChurnedUser) SetAmount(v float64)`

SetAmount sets Amount field to given value.


### GetChurnDate

`func (o *ChurnedUser) GetChurnDate() time.Time`

GetChurnDate returns the ChurnDate field if non-nil, zero value otherwise.

### GetChurnDateOk

`func (o *ChurnedUser) GetChurnDateOk() (*time.Time, bool)`

GetChurnDateOk returns a tuple with the ChurnDate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChurnDate

`func (o *ChurnedUser) SetChurnDate(v time.Time)`

SetChurnDate sets ChurnDate field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


