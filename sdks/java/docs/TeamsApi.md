# TeamsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**teamsGet**](TeamsApi.md#teamsGet) | **GET** /teams | List teams |
| [**teamsIdGet**](TeamsApi.md#teamsIdGet) | **GET** /teams/{id} | Get team details |
| [**teamsIdInvitePost**](TeamsApi.md#teamsIdInvitePost) | **POST** /teams/{id}/invite | Invite a member to the team |
| [**teamsIdMembersGet**](TeamsApi.md#teamsIdMembersGet) | **GET** /teams/{id}/members | List team members |
| [**teamsIdMembersUidDelete**](TeamsApi.md#teamsIdMembersUidDelete) | **DELETE** /teams/{id}/members/{uid} | Remove member from team |
| [**teamsIdMembersUidRolePut**](TeamsApi.md#teamsIdMembersUidRolePut) | **PUT** /teams/{id}/members/{uid}/role | Change member role |
| [**teamsPost**](TeamsApi.md#teamsPost) | **POST** /teams | Create a team |


<a id="teamsGet"></a>
# **teamsGet**
> List&lt;Team&gt; teamsGet()

List teams

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TeamsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TeamsApi apiInstance = new TeamsApi(defaultClient);
    try {
      List<Team> result = apiInstance.teamsGet();
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling TeamsApi#teamsGet");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

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

<a id="teamsIdGet"></a>
# **teamsIdGet**
> TeamDetailResponse teamsIdGet(id)

Get team details

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TeamsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TeamsApi apiInstance = new TeamsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      TeamDetailResponse result = apiInstance.teamsIdGet(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling TeamsApi#teamsIdGet");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **UUID**|  | |

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

<a id="teamsIdInvitePost"></a>
# **teamsIdInvitePost**
> teamsIdInvitePost(id, inviteRequest)

Invite a member to the team

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TeamsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TeamsApi apiInstance = new TeamsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    InviteRequest inviteRequest = new InviteRequest(); // InviteRequest | 
    try {
      apiInstance.teamsIdInvitePost(id, inviteRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling TeamsApi#teamsIdInvitePost");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **UUID**|  | |
| **inviteRequest** | [**InviteRequest**](InviteRequest.md)|  | |

### Return type

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Invitation sent |  -  |

<a id="teamsIdMembersGet"></a>
# **teamsIdMembersGet**
> List&lt;TeamMember&gt; teamsIdMembersGet(id)

List team members

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TeamsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TeamsApi apiInstance = new TeamsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    try {
      List<TeamMember> result = apiInstance.teamsIdMembersGet(id);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling TeamsApi#teamsIdMembersGet");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **UUID**|  | |

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

<a id="teamsIdMembersUidDelete"></a>
# **teamsIdMembersUidDelete**
> teamsIdMembersUidDelete(id, uid)

Remove member from team

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TeamsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TeamsApi apiInstance = new TeamsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    UUID uid = UUID.randomUUID(); // UUID | 
    try {
      apiInstance.teamsIdMembersUidDelete(id, uid);
    } catch (ApiException e) {
      System.err.println("Exception when calling TeamsApi#teamsIdMembersUidDelete");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **UUID**|  | |
| **uid** | **UUID**|  | |

### Return type

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Member removed |  -  |

<a id="teamsIdMembersUidRolePut"></a>
# **teamsIdMembersUidRolePut**
> teamsIdMembersUidRolePut(id, uid, changeRoleRequest)

Change member role

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TeamsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TeamsApi apiInstance = new TeamsApi(defaultClient);
    UUID id = UUID.randomUUID(); // UUID | 
    UUID uid = UUID.randomUUID(); // UUID | 
    ChangeRoleRequest changeRoleRequest = new ChangeRoleRequest(); // ChangeRoleRequest | 
    try {
      apiInstance.teamsIdMembersUidRolePut(id, uid, changeRoleRequest);
    } catch (ApiException e) {
      System.err.println("Exception when calling TeamsApi#teamsIdMembersUidRolePut");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | **UUID**|  | |
| **uid** | **UUID**|  | |
| **changeRoleRequest** | [**ChangeRoleRequest**](ChangeRoleRequest.md)|  | |

### Return type

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Role changed |  -  |

<a id="teamsPost"></a>
# **teamsPost**
> Team teamsPost(createTeamRequest)

Create a team

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.TeamsApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    TeamsApi apiInstance = new TeamsApi(defaultClient);
    CreateTeamRequest createTeamRequest = new CreateTeamRequest(); // CreateTeamRequest | 
    try {
      Team result = apiInstance.teamsPost(createTeamRequest);
      System.out.println(result);
    } catch (ApiException e) {
      System.err.println("Exception when calling TeamsApi#teamsPost");
      System.err.println("Status code: " + e.getCode());
      System.err.println("Reason: " + e.getResponseBody());
      System.err.println("Response headers: " + e.getResponseHeaders());
      e.printStackTrace();
    }
  }
}
```

### Parameters

| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createTeamRequest** | [**CreateTeamRequest**](CreateTeamRequest.md)|  | |

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

