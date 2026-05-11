# TeamDetailResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Team** | [**Team**](Team.md) |  | 
**Members** | [**[]TeamMember**](TeamMember.md) |  | 
**Invites** | [**[]TeamInvite**](TeamInvite.md) |  | 

## Methods

### NewTeamDetailResponse

`func NewTeamDetailResponse(team Team, members []TeamMember, invites []TeamInvite, ) *TeamDetailResponse`

NewTeamDetailResponse instantiates a new TeamDetailResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTeamDetailResponseWithDefaults

`func NewTeamDetailResponseWithDefaults() *TeamDetailResponse`

NewTeamDetailResponseWithDefaults instantiates a new TeamDetailResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTeam

`func (o *TeamDetailResponse) GetTeam() Team`

GetTeam returns the Team field if non-nil, zero value otherwise.

### GetTeamOk

`func (o *TeamDetailResponse) GetTeamOk() (*Team, bool)`

GetTeamOk returns a tuple with the Team field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTeam

`func (o *TeamDetailResponse) SetTeam(v Team)`

SetTeam sets Team field to given value.


### GetMembers

`func (o *TeamDetailResponse) GetMembers() []TeamMember`

GetMembers returns the Members field if non-nil, zero value otherwise.

### GetMembersOk

`func (o *TeamDetailResponse) GetMembersOk() (*[]TeamMember, bool)`

GetMembersOk returns a tuple with the Members field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMembers

`func (o *TeamDetailResponse) SetMembers(v []TeamMember)`

SetMembers sets Members field to given value.


### GetInvites

`func (o *TeamDetailResponse) GetInvites() []TeamInvite`

GetInvites returns the Invites field if non-nil, zero value otherwise.

### GetInvitesOk

`func (o *TeamDetailResponse) GetInvitesOk() (*[]TeamInvite, bool)`

GetInvitesOk returns a tuple with the Invites field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInvites

`func (o *TeamDetailResponse) SetInvites(v []TeamInvite)`

SetInvites sets Invites field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


