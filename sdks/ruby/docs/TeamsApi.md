# OpenapiClient::TeamsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**teams_get**](TeamsApi.md#teams_get) | **GET** /teams | List teams |
| [**teams_id_get**](TeamsApi.md#teams_id_get) | **GET** /teams/{id} | Get team details |
| [**teams_id_invite_post**](TeamsApi.md#teams_id_invite_post) | **POST** /teams/{id}/invite | Invite a member to the team |
| [**teams_id_members_get**](TeamsApi.md#teams_id_members_get) | **GET** /teams/{id}/members | List team members |
| [**teams_id_members_uid_delete**](TeamsApi.md#teams_id_members_uid_delete) | **DELETE** /teams/{id}/members/{uid} | Remove member from team |
| [**teams_id_members_uid_role_put**](TeamsApi.md#teams_id_members_uid_role_put) | **PUT** /teams/{id}/members/{uid}/role | Change member role |
| [**teams_post**](TeamsApi.md#teams_post) | **POST** /teams | Create a team |


## teams_get

> <Array<Team>> teams_get

List teams

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TeamsApi.new

begin
  # List teams
  result = api_instance.teams_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_get: #{e}"
end
```

#### Using the teams_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<Team>>, Integer, Hash)> teams_get_with_http_info

```ruby
begin
  # List teams
  data, status_code, headers = api_instance.teams_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<Team>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;Team&gt;**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## teams_id_get

> <TeamDetailResponse> teams_id_get(id)

Get team details

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TeamsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Get team details
  result = api_instance.teams_id_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_get: #{e}"
end
```

#### Using the teams_id_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<TeamDetailResponse>, Integer, Hash)> teams_id_get_with_http_info(id)

```ruby
begin
  # Get team details
  data, status_code, headers = api_instance.teams_id_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <TeamDetailResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**TeamDetailResponse**](TeamDetailResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## teams_id_invite_post

> teams_id_invite_post(id, invite_request)

Invite a member to the team

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TeamsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
invite_request = OpenapiClient::InviteRequest.new({email: 'email_example'}) # InviteRequest | 

begin
  # Invite a member to the team
  api_instance.teams_id_invite_post(id, invite_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_invite_post: #{e}"
end
```

#### Using the teams_id_invite_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> teams_id_invite_post_with_http_info(id, invite_request)

```ruby
begin
  # Invite a member to the team
  data, status_code, headers = api_instance.teams_id_invite_post_with_http_info(id, invite_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_invite_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **invite_request** | [**InviteRequest**](InviteRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## teams_id_members_get

> <Array<TeamMember>> teams_id_members_get(id)

List team members

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TeamsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # List team members
  result = api_instance.teams_id_members_get(id)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_members_get: #{e}"
end
```

#### Using the teams_id_members_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Array<TeamMember>>, Integer, Hash)> teams_id_members_get_with_http_info(id)

```ruby
begin
  # List team members
  data, status_code, headers = api_instance.teams_id_members_get_with_http_info(id)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Array<TeamMember>>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_members_get_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |

### Return type

[**Array&lt;TeamMember&gt;**](TeamMember.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## teams_id_members_uid_delete

> teams_id_members_uid_delete(id, uid)

Remove member from team

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TeamsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
uid = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 

begin
  # Remove member from team
  api_instance.teams_id_members_uid_delete(id, uid)
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_members_uid_delete: #{e}"
end
```

#### Using the teams_id_members_uid_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> teams_id_members_uid_delete_with_http_info(id, uid)

```ruby
begin
  # Remove member from team
  data, status_code, headers = api_instance.teams_id_members_uid_delete_with_http_info(id, uid)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_members_uid_delete_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **uid** | **String** |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## teams_id_members_uid_role_put

> teams_id_members_uid_role_put(id, uid, change_role_request)

Change member role

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TeamsApi.new
id = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
uid = '38400000-8cf0-11bd-b23e-10b96e4ef00d' # String | 
change_role_request = OpenapiClient::ChangeRoleRequest.new({role: 'admin'}) # ChangeRoleRequest | 

begin
  # Change member role
  api_instance.teams_id_members_uid_role_put(id, uid, change_role_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_members_uid_role_put: #{e}"
end
```

#### Using the teams_id_members_uid_role_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> teams_id_members_uid_role_put_with_http_info(id, uid, change_role_request)

```ruby
begin
  # Change member role
  data, status_code, headers = api_instance.teams_id_members_uid_role_put_with_http_info(id, uid, change_role_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_id_members_uid_role_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **uid** | **String** |  |  |
| **change_role_request** | [**ChangeRoleRequest**](ChangeRoleRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## teams_post

> <Team> teams_post(create_team_request)

Create a team

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::TeamsApi.new
create_team_request = OpenapiClient::CreateTeamRequest.new({name: 'name_example'}) # CreateTeamRequest | 

begin
  # Create a team
  result = api_instance.teams_post(create_team_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_post: #{e}"
end
```

#### Using the teams_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Team>, Integer, Hash)> teams_post_with_http_info(create_team_request)

```ruby
begin
  # Create a team
  data, status_code, headers = api_instance.teams_post_with_http_info(create_team_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Team>
rescue OpenapiClient::ApiError => e
  puts "Error when calling TeamsApi->teams_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **create_team_request** | [**CreateTeamRequest**](CreateTeamRequest.md) |  |  |

### Return type

[**Team**](Team.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

