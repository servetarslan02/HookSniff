# TeamsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**teamsGet**](TeamsApi.md#teamsGet) | **GET** /teams | List teams |
| [**teamsIdGet**](TeamsApi.md#teamsIdGet) | **GET** /teams/{id} | Get team details |
| [**teamsIdInvitePost**](TeamsApi.md#teamsIdInvitePost) | **POST** /teams/{id}/invite | Invite a member to the team |
| [**teamsIdMembersGet**](TeamsApi.md#teamsIdMembersGet) | **GET** /teams/{id}/members | List team members |
| [**teamsIdMembersUidDelete**](TeamsApi.md#teamsIdMembersUidDelete) | **DELETE** /teams/{id}/members/{uid} | Remove member from team |
| [**teamsIdMembersUidRolePut**](TeamsApi.md#teamsIdMembersUidRolePut) | **PUT** /teams/{id}/members/{uid}/role | Change member role |
| [**teamsPost**](TeamsApi.md#teamsPost) | **POST** /teams | Create a team |


<a id="teamsGet"></a>
# **teamsGet**
> kotlin.collections.List&lt;Team&gt; teamsGet()

List teams

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TeamsApi()
try {
    val result : kotlin.collections.List<Team> = apiInstance.teamsGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TeamsApi#teamsGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TeamsApi#teamsGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**kotlin.collections.List&lt;Team&gt;**](Team.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="teamsIdGet"></a>
# **teamsIdGet**
> TeamDetailResponse teamsIdGet(id)

Get team details

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TeamsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : TeamDetailResponse = apiInstance.teamsIdGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TeamsApi#teamsIdGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TeamsApi#teamsIdGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**TeamDetailResponse**](TeamDetailResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="teamsIdInvitePost"></a>
# **teamsIdInvitePost**
> teamsIdInvitePost(id, inviteRequest)

Invite a member to the team

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TeamsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val inviteRequest : InviteRequest =  // InviteRequest | 
try {
    apiInstance.teamsIdInvitePost(id, inviteRequest)
} catch (e: ClientException) {
    println("4xx response calling TeamsApi#teamsIdInvitePost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TeamsApi#teamsIdInvitePost")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **inviteRequest** | [**InviteRequest**](InviteRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="teamsIdMembersGet"></a>
# **teamsIdMembersGet**
> kotlin.collections.List&lt;TeamMember&gt; teamsIdMembersGet(id)

List team members

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TeamsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    val result : kotlin.collections.List<TeamMember> = apiInstance.teamsIdMembersGet(id)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TeamsApi#teamsIdMembersGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TeamsApi#teamsIdMembersGet")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **java.util.UUID**|  | |

### Return type

[**kotlin.collections.List&lt;TeamMember&gt;**](TeamMember.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="teamsIdMembersUidDelete"></a>
# **teamsIdMembersUidDelete**
> teamsIdMembersUidDelete(id, uid)

Remove member from team

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TeamsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val uid : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
try {
    apiInstance.teamsIdMembersUidDelete(id, uid)
} catch (e: ClientException) {
    println("4xx response calling TeamsApi#teamsIdMembersUidDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TeamsApi#teamsIdMembersUidDelete")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **uid** | **java.util.UUID**|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="teamsIdMembersUidRolePut"></a>
# **teamsIdMembersUidRolePut**
> teamsIdMembersUidRolePut(id, uid, changeRoleRequest)

Change member role

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TeamsApi()
val id : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val uid : java.util.UUID = 38400000-8cf0-11bd-b23e-10b96e4ef00d // java.util.UUID | 
val changeRoleRequest : ChangeRoleRequest =  // ChangeRoleRequest | 
try {
    apiInstance.teamsIdMembersUidRolePut(id, uid, changeRoleRequest)
} catch (e: ClientException) {
    println("4xx response calling TeamsApi#teamsIdMembersUidRolePut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TeamsApi#teamsIdMembersUidRolePut")
    e.printStackTrace()
}
```

### Parameters
| **id** | **java.util.UUID**|  | |
| **uid** | **java.util.UUID**|  | |
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **changeRoleRequest** | [**ChangeRoleRequest**](ChangeRoleRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="teamsPost"></a>
# **teamsPost**
> Team teamsPost(createTeamRequest)

Create a team

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = TeamsApi()
val createTeamRequest : CreateTeamRequest =  // CreateTeamRequest | 
try {
    val result : Team = apiInstance.teamsPost(createTeamRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling TeamsApi#teamsPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling TeamsApi#teamsPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **createTeamRequest** | [**CreateTeamRequest**](CreateTeamRequest.md)|  | |

### Return type

[**Team**](Team.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

