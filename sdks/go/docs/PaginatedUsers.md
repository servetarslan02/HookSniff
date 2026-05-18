# PaginatedUsers

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Users** | [**[]UserSummary**](UserSummary.md) |  | 
**Total** | **int32** |  | 
**Page** | **int32** |  | 
**PerPage** | **int32** |  | 

## Methods

### NewPaginatedUsers

`func NewPaginatedUsers(users []UserSummary, total int32, page int32, perPage int32, ) *PaginatedUsers`

NewPaginatedUsers instantiates a new PaginatedUsers object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPaginatedUsersWithDefaults

`func NewPaginatedUsersWithDefaults() *PaginatedUsers`

NewPaginatedUsersWithDefaults instantiates a new PaginatedUsers object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUsers

`func (o *PaginatedUsers) GetUsers() []UserSummary`

GetUsers returns the Users field if non-nil, zero value otherwise.

### GetUsersOk

`func (o *PaginatedUsers) GetUsersOk() (*[]UserSummary, bool)`

GetUsersOk returns a tuple with the Users field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsers

`func (o *PaginatedUsers) SetUsers(v []UserSummary)`

SetUsers sets Users field to given value.


### GetTotal

`func (o *PaginatedUsers) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *PaginatedUsers) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *PaginatedUsers) SetTotal(v int32)`

SetTotal sets Total field to given value.


### GetPage

`func (o *PaginatedUsers) GetPage() int32`

GetPage returns the Page field if non-nil, zero value otherwise.

### GetPageOk

`func (o *PaginatedUsers) GetPageOk() (*int32, bool)`

GetPageOk returns a tuple with the Page field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPage

`func (o *PaginatedUsers) SetPage(v int32)`

SetPage sets Page field to given value.


### GetPerPage

`func (o *PaginatedUsers) GetPerPage() int32`

GetPerPage returns the PerPage field if non-nil, zero value otherwise.

### GetPerPageOk

`func (o *PaginatedUsers) GetPerPageOk() (*int32, bool)`

GetPerPageOk returns a tuple with the PerPage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPerPage

`func (o *PaginatedUsers) SetPerPage(v int32)`

SetPerPage sets PerPage field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


