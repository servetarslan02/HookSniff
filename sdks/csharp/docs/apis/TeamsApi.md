# hooksniff.Api.TeamsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**TeamsGet**](TeamsApi.md#teamsget) | **GET** /teams | List teams |
| [**TeamsIdGet**](TeamsApi.md#teamsidget) | **GET** /teams/{id} | Get team details |
| [**TeamsIdInvitePost**](TeamsApi.md#teamsidinvitepost) | **POST** /teams/{id}/invite | Invite a member to the team |
| [**TeamsIdMembersGet**](TeamsApi.md#teamsidmembersget) | **GET** /teams/{id}/members | List team members |
| [**TeamsIdMembersUidDelete**](TeamsApi.md#teamsidmembersuiddelete) | **DELETE** /teams/{id}/members/{uid} | Remove member from team |
| [**TeamsIdMembersUidRolePut**](TeamsApi.md#teamsidmembersuidroleput) | **PUT** /teams/{id}/members/{uid}/role | Change member role |
| [**TeamsPost**](TeamsApi.md#teamspost) | **POST** /teams | Create a team |

<a id="teamsget"></a>
# **TeamsGet**
> List&lt;Team&gt; TeamsGet ()

List teams


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;Team&gt;**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Team list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="teamsidget"></a>
# **TeamsIdGet**
> TeamDetailResponse TeamsIdGet (Guid id)

Get team details


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**TeamDetailResponse**](TeamDetailResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Team details with members and invites |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="teamsidinvitepost"></a>
# **TeamsIdInvitePost**
> void TeamsIdInvitePost (Guid id, InviteRequest inviteRequest)

Invite a member to the team


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **inviteRequest** | [**InviteRequest**](InviteRequest.md) |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Invitation sent |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="teamsidmembersget"></a>
# **TeamsIdMembersGet**
> List&lt;TeamMember&gt; TeamsIdMembersGet (Guid id)

List team members


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**List&lt;TeamMember&gt;**](TeamMember.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Member list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="teamsidmembersuiddelete"></a>
# **TeamsIdMembersUidDelete**
> void TeamsIdMembersUidDelete (Guid id, Guid uid)

Remove member from team


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **uid** | **Guid** |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Member removed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="teamsidmembersuidroleput"></a>
# **TeamsIdMembersUidRolePut**
> void TeamsIdMembersUidRolePut (Guid id, Guid uid, ChangeRoleRequest changeRoleRequest)

Change member role


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **uid** | **Guid** |  |  |
| **changeRoleRequest** | [**ChangeRoleRequest**](ChangeRoleRequest.md) |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Role changed |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="teamspost"></a>
# **TeamsPost**
> Team TeamsPost (CreateTeamRequest createTeamRequest)

Create a team


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **createTeamRequest** | [**CreateTeamRequest**](CreateTeamRequest.md) |  |  |

### Return type

[**Team**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Team created |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

