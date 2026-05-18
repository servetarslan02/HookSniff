# OpenAPI\Client\TeamsApi

Team management and invitations

All URIs are relative to https://hooksniff-api-1046140057667.europe-west1.run.app/v1, except if the operation defines another base path.

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**teamsGet()**](TeamsApi.md#teamsGet) | **GET** /teams | List teams |
| [**teamsIdGet()**](TeamsApi.md#teamsIdGet) | **GET** /teams/{id} | Get team details |
| [**teamsIdInvitePost()**](TeamsApi.md#teamsIdInvitePost) | **POST** /teams/{id}/invite | Invite a member to the team |
| [**teamsIdMembersGet()**](TeamsApi.md#teamsIdMembersGet) | **GET** /teams/{id}/members | List team members |
| [**teamsIdMembersUidDelete()**](TeamsApi.md#teamsIdMembersUidDelete) | **DELETE** /teams/{id}/members/{uid} | Remove member from team |
| [**teamsIdMembersUidRolePut()**](TeamsApi.md#teamsIdMembersUidRolePut) | **PUT** /teams/{id}/members/{uid}/role | Change member role |
| [**teamsPost()**](TeamsApi.md#teamsPost) | **POST** /teams | Create a team |


## `teamsGet()`

```php
teamsGet(): \OpenAPI\Client\Model\Team[]
```

List teams

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TeamsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);

try {
    $result = $apiInstance->teamsGet();
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TeamsApi->teamsGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**\OpenAPI\Client\Model\Team[]**](../Model/Team.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `teamsIdGet()`

```php
teamsIdGet($id): \OpenAPI\Client\Model\TeamDetailResponse
```

Get team details

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TeamsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->teamsIdGet($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TeamsApi->teamsIdGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\TeamDetailResponse**](../Model/TeamDetailResponse.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `teamsIdInvitePost()`

```php
teamsIdInvitePost($id, $invite_request)
```

Invite a member to the team

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TeamsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$invite_request = new \OpenAPI\Client\Model\InviteRequest(); // \OpenAPI\Client\Model\InviteRequest

try {
    $apiInstance->teamsIdInvitePost($id, $invite_request);
} catch (Exception $e) {
    echo 'Exception when calling TeamsApi->teamsIdInvitePost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **invite_request** | [**\OpenAPI\Client\Model\InviteRequest**](../Model/InviteRequest.md)|  | |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `teamsIdMembersGet()`

```php
teamsIdMembersGet($id): \OpenAPI\Client\Model\TeamMember[]
```

List team members

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TeamsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string

try {
    $result = $apiInstance->teamsIdMembersGet($id);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TeamsApi->teamsIdMembersGet: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |

### Return type

[**\OpenAPI\Client\Model\TeamMember[]**](../Model/TeamMember.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `teamsIdMembersUidDelete()`

```php
teamsIdMembersUidDelete($id, $uid)
```

Remove member from team

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TeamsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$uid = 'uid_example'; // string

try {
    $apiInstance->teamsIdMembersUidDelete($id, $uid);
} catch (Exception $e) {
    echo 'Exception when calling TeamsApi->teamsIdMembersUidDelete: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **uid** | **string**|  | |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `teamsIdMembersUidRolePut()`

```php
teamsIdMembersUidRolePut($id, $uid, $change_role_request)
```

Change member role

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TeamsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$id = 'id_example'; // string
$uid = 'uid_example'; // string
$change_role_request = new \OpenAPI\Client\Model\ChangeRoleRequest(); // \OpenAPI\Client\Model\ChangeRoleRequest

try {
    $apiInstance->teamsIdMembersUidRolePut($id, $uid, $change_role_request);
} catch (Exception $e) {
    echo 'Exception when calling TeamsApi->teamsIdMembersUidRolePut: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **id** | **string**|  | |
| **uid** | **string**|  | |
| **change_role_request** | [**\OpenAPI\Client\Model\ChangeRoleRequest**](../Model/ChangeRoleRequest.md)|  | |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)

## `teamsPost()`

```php
teamsPost($create_team_request): \OpenAPI\Client\Model\Team
```

Create a team

### Example

```php
<?php
require_once(__DIR__ . '/vendor/autoload.php');


// Configure Bearer authorization: BearerAuth
$config = OpenAPI\Client\Configuration::getDefaultConfiguration()->setAccessToken('YOUR_ACCESS_TOKEN');


$apiInstance = new OpenAPI\Client\Api\TeamsApi(
    // If you want use custom http client, pass your client which implements `GuzzleHttp\ClientInterface`.
    // This is optional, `GuzzleHttp\Client` will be used as default.
    new GuzzleHttp\Client(),
    $config
);
$create_team_request = new \OpenAPI\Client\Model\CreateTeamRequest(); // \OpenAPI\Client\Model\CreateTeamRequest

try {
    $result = $apiInstance->teamsPost($create_team_request);
    print_r($result);
} catch (Exception $e) {
    echo 'Exception when calling TeamsApi->teamsPost: ', $e->getMessage(), PHP_EOL;
}
```

### Parameters

| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **create_team_request** | [**\OpenAPI\Client\Model\CreateTeamRequest**](../Model/CreateTeamRequest.md)|  | |

### Return type

[**\OpenAPI\Client\Model\Team**](../Model/Team.md)

### Authorization

[BearerAuth](../../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

[[Back to top]](#) [[Back to API list]](../../README.md#endpoints)
[[Back to Model list]](../../README.md#models)
[[Back to README]](../../README.md)
