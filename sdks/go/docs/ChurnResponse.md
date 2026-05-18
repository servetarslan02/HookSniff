# ChurnResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Users** | [**[]ChurnedUser**](ChurnedUser.md) |  | 

## Methods

### NewChurnResponse

`func NewChurnResponse(users []ChurnedUser, ) *ChurnResponse`

NewChurnResponse instantiates a new ChurnResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewChurnResponseWithDefaults

`func NewChurnResponseWithDefaults() *ChurnResponse`

NewChurnResponseWithDefaults instantiates a new ChurnResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUsers

`func (o *ChurnResponse) GetUsers() []ChurnedUser`

GetUsers returns the Users field if non-nil, zero value otherwise.

### GetUsersOk

`func (o *ChurnResponse) GetUsersOk() (*[]ChurnedUser, bool)`

GetUsersOk returns a tuple with the Users field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUsers

`func (o *ChurnResponse) SetUsers(v []ChurnedUser)`

SetUsers sets Users field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


