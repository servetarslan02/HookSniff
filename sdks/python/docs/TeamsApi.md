# hooksniff.TeamsApi

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


# **teams_get**
> List[Team] teams_get()

List teams

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.team import Team
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.TeamsApi(api_client)

    try:
        # List teams
        api_response = api_instance.teams_get()
        print("The response of TeamsApi->teams_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TeamsApi->teams_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[Team]**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Team list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teams_id_get**
> TeamDetailResponse teams_id_get(id)

Get team details

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.team_detail_response import TeamDetailResponse
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.TeamsApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Get team details
        api_response = api_instance.teams_id_get(id)
        print("The response of TeamsApi->teams_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TeamsApi->teams_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

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
**200** | Team details with members and invites |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teams_id_invite_post**
> teams_id_invite_post(id, invite_request)

Invite a member to the team

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.invite_request import InviteRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.TeamsApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    invite_request = hooksniff.InviteRequest() # InviteRequest | 

    try:
        # Invite a member to the team
        api_instance.teams_id_invite_post(id, invite_request)
    except Exception as e:
        print("Exception when calling TeamsApi->teams_id_invite_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **invite_request** | [**InviteRequest**](InviteRequest.md)|  | 

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
**200** | Invitation sent |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teams_id_members_get**
> List[TeamMember] teams_id_members_get(id)

List team members

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.team_member import TeamMember
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.TeamsApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # List team members
        api_response = api_instance.teams_id_members_get(id)
        print("The response of TeamsApi->teams_id_members_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TeamsApi->teams_id_members_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

### Return type

[**List[TeamMember]**](TeamMember.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Member list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teams_id_members_uid_delete**
> teams_id_members_uid_delete(id, uid)

Remove member from team

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.TeamsApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    uid = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Remove member from team
        api_instance.teams_id_members_uid_delete(id, uid)
    except Exception as e:
        print("Exception when calling TeamsApi->teams_id_members_uid_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **uid** | **UUID**|  | 

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
**200** | Member removed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teams_id_members_uid_role_put**
> teams_id_members_uid_role_put(id, uid, change_role_request)

Change member role

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.change_role_request import ChangeRoleRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.TeamsApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    uid = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    change_role_request = hooksniff.ChangeRoleRequest() # ChangeRoleRequest | 

    try:
        # Change member role
        api_instance.teams_id_members_uid_role_put(id, uid, change_role_request)
    except Exception as e:
        print("Exception when calling TeamsApi->teams_id_members_uid_role_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **uid** | **UUID**|  | 
 **change_role_request** | [**ChangeRoleRequest**](ChangeRoleRequest.md)|  | 

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
**200** | Role changed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **teams_post**
> Team teams_post(create_team_request)

Create a team

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.create_team_request import CreateTeamRequest
from hooksniff.models.team import Team
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure Bearer authorization: BearerAuth
configuration = hooksniff.Configuration(
    access_token = os.environ["BEARER_TOKEN"]
)

# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.TeamsApi(api_client)
    create_team_request = hooksniff.CreateTeamRequest() # CreateTeamRequest | 

    try:
        # Create a team
        api_response = api_instance.teams_post(create_team_request)
        print("The response of TeamsApi->teams_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TeamsApi->teams_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **create_team_request** | [**CreateTeamRequest**](CreateTeamRequest.md)|  | 

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
**201** | Team created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

