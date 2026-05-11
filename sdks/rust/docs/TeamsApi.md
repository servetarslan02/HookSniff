# \TeamsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**teams_get**](TeamsApi.md#teams_get) | **GET** /teams | List teams
[**teams_id_get**](TeamsApi.md#teams_id_get) | **GET** /teams/{id} | Get team details
[**teams_id_invite_post**](TeamsApi.md#teams_id_invite_post) | **POST** /teams/{id}/invite | Invite a member to the team
[**teams_id_members_get**](TeamsApi.md#teams_id_members_get) | **GET** /teams/{id}/members | List team members
[**teams_id_members_uid_delete**](TeamsApi.md#teams_id_members_uid_delete) | **DELETE** /teams/{id}/members/{uid} | Remove member from team
[**teams_id_members_uid_role_put**](TeamsApi.md#teams_id_members_uid_role_put) | **PUT** /teams/{id}/members/{uid}/role | Change member role
[**teams_post**](TeamsApi.md#teams_post) | **POST** /teams | Create a team



## teams_get

> Vec<models::Team> teams_get()
List teams

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::Team>**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## teams_id_get

> models::TeamDetailResponse teams_id_get(id)
Get team details

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::TeamDetailResponse**](TeamDetailResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## teams_id_invite_post

> teams_id_invite_post(id, invite_request)
Invite a member to the team

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**invite_request** | [**InviteRequest**](InviteRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## teams_id_members_get

> Vec<models::TeamMember> teams_id_members_get(id)
List team members

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**Vec<models::TeamMember>**](TeamMember.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## teams_id_members_uid_delete

> teams_id_members_uid_delete(id, uid)
Remove member from team

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**uid** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## teams_id_members_uid_role_put

> teams_id_members_uid_role_put(id, uid, change_role_request)
Change member role

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**uid** | **uuid::Uuid** |  | [required] |
**change_role_request** | [**ChangeRoleRequest**](ChangeRoleRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## teams_post

> models::Team teams_post(create_team_request)
Create a team

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**create_team_request** | [**CreateTeamRequest**](CreateTeamRequest.md) |  | [required] |

### Return type

[**models::Team**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

