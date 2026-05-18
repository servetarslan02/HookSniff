# TeamsAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**teamsGet**](TeamsAPI.md#teamsget) | **GET** /teams | List teams
[**teamsIdGet**](TeamsAPI.md#teamsidget) | **GET** /teams/{id} | Get team details
[**teamsIdInvitePost**](TeamsAPI.md#teamsidinvitepost) | **POST** /teams/{id}/invite | Invite a member to the team
[**teamsIdMembersGet**](TeamsAPI.md#teamsidmembersget) | **GET** /teams/{id}/members | List team members
[**teamsIdMembersUidDelete**](TeamsAPI.md#teamsidmembersuiddelete) | **DELETE** /teams/{id}/members/{uid} | Remove member from team
[**teamsIdMembersUidRolePut**](TeamsAPI.md#teamsidmembersuidroleput) | **PUT** /teams/{id}/members/{uid}/role | Change member role
[**teamsPost**](TeamsAPI.md#teamspost) | **POST** /teams | Create a team


# **teamsGet**
```swift
    open class func teamsGet(completion: @escaping (_ data: [Team]?, _ error: Error?) -> Void)
```

List teams

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// List teams
TeamsAPI.teamsGet() { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**[Team]**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdGet**
```swift
    open class func teamsIdGet(id: UUID, completion: @escaping (_ data: TeamDetailResponse?, _ error: Error?) -> Void)
```

Get team details

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// Get team details
TeamsAPI.teamsIdGet(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 

### Return type

[**TeamDetailResponse**](TeamDetailResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdInvitePost**
```swift
    open class func teamsIdInvitePost(id: UUID, inviteRequest: InviteRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Invite a member to the team

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let inviteRequest = InviteRequest(email: "email_example", role: "role_example") // InviteRequest | 

// Invite a member to the team
TeamsAPI.teamsIdInvitePost(id: id, inviteRequest: inviteRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 
 **inviteRequest** | [**InviteRequest**](InviteRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdMembersGet**
```swift
    open class func teamsIdMembersGet(id: UUID, completion: @escaping (_ data: [TeamMember]?, _ error: Error?) -> Void)
```

List team members

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 

// List team members
TeamsAPI.teamsIdMembersGet(id: id) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 

### Return type

[**[TeamMember]**](TeamMember.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdMembersUidDelete**
```swift
    open class func teamsIdMembersUidDelete(id: UUID, uid: UUID, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Remove member from team

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let uid = 987 // UUID | 

// Remove member from team
TeamsAPI.teamsIdMembersUidDelete(id: id, uid: uid) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 
 **uid** | **UUID** |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsIdMembersUidRolePut**
```swift
    open class func teamsIdMembersUidRolePut(id: UUID, uid: UUID, changeRoleRequest: ChangeRoleRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Change member role

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let id = 987 // UUID | 
let uid = 987 // UUID | 
let changeRoleRequest = ChangeRoleRequest(role: "role_example") // ChangeRoleRequest | 

// Change member role
TeamsAPI.teamsIdMembersUidRolePut(id: id, uid: uid, changeRoleRequest: changeRoleRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID** |  | 
 **uid** | **UUID** |  | 
 **changeRoleRequest** | [**ChangeRoleRequest**](ChangeRoleRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teamsPost**
```swift
    open class func teamsPost(createTeamRequest: CreateTeamRequest, completion: @escaping (_ data: Team?, _ error: Error?) -> Void)
```

Create a team

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let createTeamRequest = CreateTeamRequest(name: "name_example") // CreateTeamRequest | 

// Create a team
TeamsAPI.teamsPost(createTeamRequest: createTeamRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createTeamRequest** | [**CreateTeamRequest**](CreateTeamRequest.md) |  | 

### Return type

[**Team**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

