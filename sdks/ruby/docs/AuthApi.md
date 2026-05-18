# OpenapiClient::AuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------ | ------------ | ----------- |
| [**auth2fa_confirm_post**](AuthApi.md#auth2fa_confirm_post) | **POST** /auth/2fa/confirm | Confirm 2FA setup with a code |
| [**auth2fa_disable_post**](AuthApi.md#auth2fa_disable_post) | **POST** /auth/2fa/disable | Disable 2FA |
| [**auth2fa_enable_post**](AuthApi.md#auth2fa_enable_post) | **POST** /auth/2fa/enable | Enable 2FA (returns TOTP secret and QR URL) |
| [**auth2fa_status_get**](AuthApi.md#auth2fa_status_get) | **GET** /auth/2fa/status | Get 2FA status |
| [**auth2fa_verify_post**](AuthApi.md#auth2fa_verify_post) | **POST** /auth/2fa/verify | Verify 2FA code during login |
| [**auth_account_delete**](AuthApi.md#auth_account_delete) | **DELETE** /auth/account | Delete account (GDPR) |
| [**auth_consent_get**](AuthApi.md#auth_consent_get) | **GET** /auth/consent | Get consent preferences |
| [**auth_consent_post**](AuthApi.md#auth_consent_post) | **POST** /auth/consent | Update a consent preference |
| [**auth_export_get**](AuthApi.md#auth_export_get) | **GET** /auth/export | Export user data (GDPR) |
| [**auth_forgot_password_post**](AuthApi.md#auth_forgot_password_post) | **POST** /auth/forgot-password | Request password reset email |
| [**auth_login_post**](AuthApi.md#auth_login_post) | **POST** /auth/login | Login with email and password |
| [**auth_logout_post**](AuthApi.md#auth_logout_post) | **POST** /auth/logout | Logout (invalidate refresh token) |
| [**auth_me_get**](AuthApi.md#auth_me_get) | **GET** /auth/me | Get current user profile |
| [**auth_password_put**](AuthApi.md#auth_password_put) | **PUT** /auth/password | Change password |
| [**auth_profile_put**](AuthApi.md#auth_profile_put) | **PUT** /auth/profile | Update profile |
| [**auth_refresh_post**](AuthApi.md#auth_refresh_post) | **POST** /auth/refresh | Refresh access token |
| [**auth_register_post**](AuthApi.md#auth_register_post) | **POST** /auth/register | Register a new account |
| [**auth_resend_verification_post**](AuthApi.md#auth_resend_verification_post) | **POST** /auth/resend-verification | Resend verification email |
| [**auth_reset_password_post**](AuthApi.md#auth_reset_password_post) | **POST** /auth/reset-password | Reset password with token |
| [**auth_verify_email_post**](AuthApi.md#auth_verify_email_post) | **POST** /auth/verify-email | Verify email address |


## auth2fa_confirm_post

> auth2fa_confirm_post(confirm2fa_request)

Confirm 2FA setup with a code

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new
confirm2fa_request = OpenapiClient::Confirm2faRequest.new({code: 'code_example'}) # Confirm2faRequest | 

begin
  # Confirm 2FA setup with a code
  api_instance.auth2fa_confirm_post(confirm2fa_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_confirm_post: #{e}"
end
```

#### Using the auth2fa_confirm_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth2fa_confirm_post_with_http_info(confirm2fa_request)

```ruby
begin
  # Confirm 2FA setup with a code
  data, status_code, headers = api_instance.auth2fa_confirm_post_with_http_info(confirm2fa_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_confirm_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **confirm2fa_request** | [**Confirm2faRequest**](Confirm2faRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## auth2fa_disable_post

> auth2fa_disable_post(disable2fa_request)

Disable 2FA

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new
disable2fa_request = OpenapiClient::Disable2faRequest.new({password: 'password_example'}) # Disable2faRequest | 

begin
  # Disable 2FA
  api_instance.auth2fa_disable_post(disable2fa_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_disable_post: #{e}"
end
```

#### Using the auth2fa_disable_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth2fa_disable_post_with_http_info(disable2fa_request)

```ruby
begin
  # Disable 2FA
  data, status_code, headers = api_instance.auth2fa_disable_post_with_http_info(disable2fa_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_disable_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **disable2fa_request** | [**Disable2faRequest**](Disable2faRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## auth2fa_enable_post

> <Auth2faEnablePost200Response> auth2fa_enable_post(enable2fa_request)

Enable 2FA (returns TOTP secret and QR URL)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new
enable2fa_request = OpenapiClient::Enable2faRequest.new({password: 'password_example'}) # Enable2faRequest | 

begin
  # Enable 2FA (returns TOTP secret and QR URL)
  result = api_instance.auth2fa_enable_post(enable2fa_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_enable_post: #{e}"
end
```

#### Using the auth2fa_enable_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Auth2faEnablePost200Response>, Integer, Hash)> auth2fa_enable_post_with_http_info(enable2fa_request)

```ruby
begin
  # Enable 2FA (returns TOTP secret and QR URL)
  data, status_code, headers = api_instance.auth2fa_enable_post_with_http_info(enable2fa_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Auth2faEnablePost200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_enable_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **enable2fa_request** | [**Enable2faRequest**](Enable2faRequest.md) |  |  |

### Return type

[**Auth2faEnablePost200Response**](Auth2faEnablePost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## auth2fa_status_get

> <Auth2faStatusGet200Response> auth2fa_status_get

Get 2FA status

Returns whether 2FA is enabled for the authenticated user

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new

begin
  # Get 2FA status
  result = api_instance.auth2fa_status_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_status_get: #{e}"
end
```

#### Using the auth2fa_status_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<Auth2faStatusGet200Response>, Integer, Hash)> auth2fa_status_get_with_http_info

```ruby
begin
  # Get 2FA status
  data, status_code, headers = api_instance.auth2fa_status_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <Auth2faStatusGet200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_status_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Auth2faStatusGet200Response**](Auth2faStatusGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## auth2fa_verify_post

> <AuthResponse> auth2fa_verify_post(verify2fa_request)

Verify 2FA code during login

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::AuthApi.new
verify2fa_request = OpenapiClient::Verify2faRequest.new({temp_token: 'temp_token_example', code: 'code_example'}) # Verify2faRequest | 

begin
  # Verify 2FA code during login
  result = api_instance.auth2fa_verify_post(verify2fa_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_verify_post: #{e}"
end
```

#### Using the auth2fa_verify_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AuthResponse>, Integer, Hash)> auth2fa_verify_post_with_http_info(verify2fa_request)

```ruby
begin
  # Verify 2FA code during login
  data, status_code, headers = api_instance.auth2fa_verify_post_with_http_info(verify2fa_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AuthResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth2fa_verify_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **verify2fa_request** | [**Verify2faRequest**](Verify2faRequest.md) |  |  |

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## auth_account_delete

> auth_account_delete

Delete account (GDPR)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new

begin
  # Delete account (GDPR)
  api_instance.auth_account_delete
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_account_delete: #{e}"
end
```

#### Using the auth_account_delete_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth_account_delete_with_http_info

```ruby
begin
  # Delete account (GDPR)
  data, status_code, headers = api_instance.auth_account_delete_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_account_delete_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## auth_consent_get

> <AuthConsentGet200Response> auth_consent_get

Get consent preferences

Returns the authenticated user's consent preferences

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new

begin
  # Get consent preferences
  result = api_instance.auth_consent_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_consent_get: #{e}"
end
```

#### Using the auth_consent_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AuthConsentGet200Response>, Integer, Hash)> auth_consent_get_with_http_info

```ruby
begin
  # Get consent preferences
  data, status_code, headers = api_instance.auth_consent_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AuthConsentGet200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_consent_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**AuthConsentGet200Response**](AuthConsentGet200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## auth_consent_post

> <AuthConsentPost200Response> auth_consent_post(auth_consent_post_request)

Update a consent preference

Sets a single consent key to true/false

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new
auth_consent_post_request = OpenapiClient::AuthConsentPostRequest.new({key: 'key_example', value: false}) # AuthConsentPostRequest | 

begin
  # Update a consent preference
  result = api_instance.auth_consent_post(auth_consent_post_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_consent_post: #{e}"
end
```

#### Using the auth_consent_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AuthConsentPost200Response>, Integer, Hash)> auth_consent_post_with_http_info(auth_consent_post_request)

```ruby
begin
  # Update a consent preference
  data, status_code, headers = api_instance.auth_consent_post_with_http_info(auth_consent_post_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AuthConsentPost200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_consent_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **auth_consent_post_request** | [**AuthConsentPostRequest**](AuthConsentPostRequest.md) |  |  |

### Return type

[**AuthConsentPost200Response**](AuthConsentPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## auth_export_get

> auth_export_get

Export user data (GDPR)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new

begin
  # Export user data (GDPR)
  api_instance.auth_export_get
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_export_get: #{e}"
end
```

#### Using the auth_export_get_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth_export_get_with_http_info

```ruby
begin
  # Export user data (GDPR)
  data, status_code, headers = api_instance.auth_export_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_export_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## auth_forgot_password_post

> auth_forgot_password_post(forgot_password_request)

Request password reset email

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::AuthApi.new
forgot_password_request = OpenapiClient::ForgotPasswordRequest.new({email: 'email_example'}) # ForgotPasswordRequest | 

begin
  # Request password reset email
  api_instance.auth_forgot_password_post(forgot_password_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_forgot_password_post: #{e}"
end
```

#### Using the auth_forgot_password_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth_forgot_password_post_with_http_info(forgot_password_request)

```ruby
begin
  # Request password reset email
  data, status_code, headers = api_instance.auth_forgot_password_post_with_http_info(forgot_password_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_forgot_password_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **forgot_password_request** | [**ForgotPasswordRequest**](ForgotPasswordRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## auth_login_post

> <AuthLoginPost200Response> auth_login_post(login_request)

Login with email and password

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::AuthApi.new
login_request = OpenapiClient::LoginRequest.new({email: 'email_example', password: 'password_example'}) # LoginRequest | 

begin
  # Login with email and password
  result = api_instance.auth_login_post(login_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_login_post: #{e}"
end
```

#### Using the auth_login_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AuthLoginPost200Response>, Integer, Hash)> auth_login_post_with_http_info(login_request)

```ruby
begin
  # Login with email and password
  data, status_code, headers = api_instance.auth_login_post_with_http_info(login_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AuthLoginPost200Response>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_login_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **login_request** | [**LoginRequest**](LoginRequest.md) |  |  |

### Return type

[**AuthLoginPost200Response**](AuthLoginPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## auth_logout_post

> auth_logout_post

Logout (invalidate refresh token)

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new

begin
  # Logout (invalidate refresh token)
  api_instance.auth_logout_post
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_logout_post: #{e}"
end
```

#### Using the auth_logout_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth_logout_post_with_http_info

```ruby
begin
  # Logout (invalidate refresh token)
  data, status_code, headers = api_instance.auth_logout_post_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_logout_post_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


## auth_me_get

> <CustomerResponse> auth_me_get

Get current user profile

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new

begin
  # Get current user profile
  result = api_instance.auth_me_get
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_me_get: #{e}"
end
```

#### Using the auth_me_get_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CustomerResponse>, Integer, Hash)> auth_me_get_with_http_info

```ruby
begin
  # Get current user profile
  data, status_code, headers = api_instance.auth_me_get_with_http_info
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CustomerResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_me_get_with_http_info: #{e}"
end
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## auth_password_put

> auth_password_put(change_password_request)

Change password

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new
change_password_request = OpenapiClient::ChangePasswordRequest.new({current_password: 'current_password_example', new_password: 'new_password_example'}) # ChangePasswordRequest | 

begin
  # Change password
  api_instance.auth_password_put(change_password_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_password_put: #{e}"
end
```

#### Using the auth_password_put_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth_password_put_with_http_info(change_password_request)

```ruby
begin
  # Change password
  data, status_code, headers = api_instance.auth_password_put_with_http_info(change_password_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_password_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **change_password_request** | [**ChangePasswordRequest**](ChangePasswordRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## auth_profile_put

> <CustomerResponse> auth_profile_put(update_profile_request)

Update profile

### Examples

```ruby
require 'time'
require 'openapi_client'
# setup authorization
OpenapiClient.configure do |config|
  # Configure Bearer authorization: BearerAuth
  config.access_token = 'YOUR_BEARER_TOKEN'
end

api_instance = OpenapiClient::AuthApi.new
update_profile_request = OpenapiClient::UpdateProfileRequest.new({name: 'name_example', email: 'email_example'}) # UpdateProfileRequest | 

begin
  # Update profile
  result = api_instance.auth_profile_put(update_profile_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_profile_put: #{e}"
end
```

#### Using the auth_profile_put_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CustomerResponse>, Integer, Hash)> auth_profile_put_with_http_info(update_profile_request)

```ruby
begin
  # Update profile
  data, status_code, headers = api_instance.auth_profile_put_with_http_info(update_profile_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CustomerResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_profile_put_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **update_profile_request** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  |  |

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## auth_refresh_post

> <AuthResponse> auth_refresh_post(refresh_token_request)

Refresh access token

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::AuthApi.new
refresh_token_request = OpenapiClient::RefreshTokenRequest.new({refresh_token: 'refresh_token_example'}) # RefreshTokenRequest | 

begin
  # Refresh access token
  result = api_instance.auth_refresh_post(refresh_token_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_refresh_post: #{e}"
end
```

#### Using the auth_refresh_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<AuthResponse>, Integer, Hash)> auth_refresh_post_with_http_info(refresh_token_request)

```ruby
begin
  # Refresh access token
  data, status_code, headers = api_instance.auth_refresh_post_with_http_info(refresh_token_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <AuthResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_refresh_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **refresh_token_request** | [**RefreshTokenRequest**](RefreshTokenRequest.md) |  |  |

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## auth_register_post

> <CustomerResponse> auth_register_post(register_request)

Register a new account

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::AuthApi.new
register_request = OpenapiClient::RegisterRequest.new({email: 'email_example'}) # RegisterRequest | 

begin
  # Register a new account
  result = api_instance.auth_register_post(register_request)
  p result
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_register_post: #{e}"
end
```

#### Using the auth_register_post_with_http_info variant

This returns an Array which contains the response data, status code and headers.

> <Array(<CustomerResponse>, Integer, Hash)> auth_register_post_with_http_info(register_request)

```ruby
begin
  # Register a new account
  data, status_code, headers = api_instance.auth_register_post_with_http_info(register_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => <CustomerResponse>
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_register_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **register_request** | [**RegisterRequest**](RegisterRequest.md) |  |  |

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## auth_resend_verification_post

> auth_resend_verification_post(resend_verification_request)

Resend verification email

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::AuthApi.new
resend_verification_request = OpenapiClient::ResendVerificationRequest.new({email: 'email_example'}) # ResendVerificationRequest | 

begin
  # Resend verification email
  api_instance.auth_resend_verification_post(resend_verification_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_resend_verification_post: #{e}"
end
```

#### Using the auth_resend_verification_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth_resend_verification_post_with_http_info(resend_verification_request)

```ruby
begin
  # Resend verification email
  data, status_code, headers = api_instance.auth_resend_verification_post_with_http_info(resend_verification_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_resend_verification_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **resend_verification_request** | [**ResendVerificationRequest**](ResendVerificationRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## auth_reset_password_post

> auth_reset_password_post(reset_password_request)

Reset password with token

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::AuthApi.new
reset_password_request = OpenapiClient::ResetPasswordRequest.new({token: 'token_example', new_password: 'new_password_example'}) # ResetPasswordRequest | 

begin
  # Reset password with token
  api_instance.auth_reset_password_post(reset_password_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_reset_password_post: #{e}"
end
```

#### Using the auth_reset_password_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth_reset_password_post_with_http_info(reset_password_request)

```ruby
begin
  # Reset password with token
  data, status_code, headers = api_instance.auth_reset_password_post_with_http_info(reset_password_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_reset_password_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **reset_password_request** | [**ResetPasswordRequest**](ResetPasswordRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined


## auth_verify_email_post

> auth_verify_email_post(verify_email_request)

Verify email address

### Examples

```ruby
require 'time'
require 'openapi_client'

api_instance = OpenapiClient::AuthApi.new
verify_email_request = OpenapiClient::VerifyEmailRequest.new({token: 'token_example'}) # VerifyEmailRequest | 

begin
  # Verify email address
  api_instance.auth_verify_email_post(verify_email_request)
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_verify_email_post: #{e}"
end
```

#### Using the auth_verify_email_post_with_http_info variant

This returns an Array which contains the response data (`nil` in this case), status code and headers.

> <Array(nil, Integer, Hash)> auth_verify_email_post_with_http_info(verify_email_request)

```ruby
begin
  # Verify email address
  data, status_code, headers = api_instance.auth_verify_email_post_with_http_info(verify_email_request)
  p status_code # => 2xx
  p headers # => { ... }
  p data # => nil
rescue OpenapiClient::ApiError => e
  puts "Error when calling AuthApi->auth_verify_email_post_with_http_info: #{e}"
end
```

### Parameters

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **verify_email_request** | [**VerifyEmailRequest**](VerifyEmailRequest.md) |  |  |

### Return type

nil (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

