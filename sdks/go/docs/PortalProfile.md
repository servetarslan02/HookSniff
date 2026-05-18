# PortalProfile

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Email** | **string** |  | 
**Name** | Pointer to **NullableString** |  | [optional] 
**Plan** | **string** |  | 
**CreatedAt** | **time.Time** |  | 

## Methods

### NewPortalProfile

`func NewPortalProfile(id string, email string, plan string, createdAt time.Time, ) *PortalProfile`

NewPortalProfile instantiates a new PortalProfile object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPortalProfileWithDefaults

`func NewPortalProfileWithDefaults() *PortalProfile`

NewPortalProfileWithDefaults instantiates a new PortalProfile object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *PortalProfile) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *PortalProfile) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *PortalProfile) SetId(v string)`

SetId sets Id field to given value.


### GetEmail

`func (o *PortalProfile) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *PortalProfile) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *PortalProfile) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetName

`func (o *PortalProfile) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *PortalProfile) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *PortalProfile) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *PortalProfile) HasName() bool`

HasName returns a boolean if a field has been set.

### SetNameNil

`func (o *PortalProfile) SetNameNil(b bool)`

 SetNameNil sets the value for Name to be an explicit nil

### UnsetName
`func (o *PortalProfile) UnsetName()`

UnsetName ensures that no value is present for Name, not even an explicit nil
### GetPlan

`func (o *PortalProfile) GetPlan() string`

GetPlan returns the Plan field if non-nil, zero value otherwise.

### GetPlanOk

`func (o *PortalProfile) GetPlanOk() (*string, bool)`

GetPlanOk returns a tuple with the Plan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlan

`func (o *PortalProfile) SetPlan(v string)`

SetPlan sets Plan field to given value.


### GetCreatedAt

`func (o *PortalProfile) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *PortalProfile) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *PortalProfile) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


