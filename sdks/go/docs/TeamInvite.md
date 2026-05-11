# TeamInvite

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**Email** | Pointer to **string** |  | [optional] 
**Role** | Pointer to **string** |  | [optional] 
**CreatedAt** | Pointer to **time.Time** |  | [optional] 

## Methods

### NewTeamInvite

`func NewTeamInvite() *TeamInvite`

NewTeamInvite instantiates a new TeamInvite object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTeamInviteWithDefaults

`func NewTeamInviteWithDefaults() *TeamInvite`

NewTeamInviteWithDefaults instantiates a new TeamInvite object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *TeamInvite) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *TeamInvite) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *TeamInvite) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *TeamInvite) HasId() bool`

HasId returns a boolean if a field has been set.

### GetEmail

`func (o *TeamInvite) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *TeamInvite) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *TeamInvite) SetEmail(v string)`

SetEmail sets Email field to given value.

### HasEmail

`func (o *TeamInvite) HasEmail() bool`

HasEmail returns a boolean if a field has been set.

### GetRole

`func (o *TeamInvite) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *TeamInvite) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *TeamInvite) SetRole(v string)`

SetRole sets Role field to given value.

### HasRole

`func (o *TeamInvite) HasRole() bool`

HasRole returns a boolean if a field has been set.

### GetCreatedAt

`func (o *TeamInvite) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *TeamInvite) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *TeamInvite) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *TeamInvite) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


