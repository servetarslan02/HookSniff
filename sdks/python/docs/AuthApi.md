# hooksniff.AuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**auth2fa_confirm_post**](AuthApi.md#auth2fa_confirm_post) | **POST** /auth/2fa/confirm | Confirm 2FA setup with a code
[**auth2fa_disable_post**](AuthApi.md#auth2fa_disable_post) | **POST** /auth/2fa/disable | Disable 2FA
[**auth2fa_enable_post**](AuthApi.md#auth2fa_enable_post) | **POST** /auth/2fa/enable | Enable 2FA (returns TOTP secret and QR URL)
[**auth2fa_status_get**](AuthApi.md#auth2fa_status_get) | **GET** /auth/2fa/status | Get 2FA status
[**auth2fa_verify_post**](AuthApi.md#auth2fa_verify_post) | **POST** /auth/2fa/verify | Verify 2FA code during login
[**auth_account_delete**](AuthApi.md#auth_account_delete) | **DELETE** /auth/account | Delete account (GDPR)
[**auth_consent_get**](AuthApi.md#auth_consent_get) | **GET** /auth/consent | Get consent preferences
[**auth_consent_post**](AuthApi.md#auth_consent_post) | **POST** /auth/consent | Update a consent preference
[**auth_export_get**](AuthApi.md#auth_export_get) | **GET** /auth/export | Export user data (GDPR)
[**auth_forgot_password_post**](AuthApi.md#auth_forgot_password_post) | **POST** /auth/forgot-password | Request password reset email
[**auth_login_post**](AuthApi.md#auth_login_post) | **POST** /auth/login | Login with email and password
[**auth_logout_post**](AuthApi.md#auth_logout_post) | **POST** /auth/logout | Logout (invalidate refresh token)
[**auth_me_get**](AuthApi.md#auth_me_get) | **GET** /auth/me | Get current user profile
[**auth_password_put**](AuthApi.md#auth_password_put) | **PUT** /auth/password | Change password
[**auth_profile_put**](AuthApi.md#auth_profile_put) | **PUT** /auth/profile | Update profile
[**auth_refresh_post**](AuthApi.md#auth_refresh_post) | **POST** /auth/refresh | Refresh access token
[**auth_register_post**](AuthApi.md#auth_register_post) | **POST** /auth/register | Register a new account
[**auth_resend_verification_post**](AuthApi.md#auth_resend_verification_post) | **POST** /auth/resend-verification | Resend verification email
[**auth_reset_password_post**](AuthApi.md#auth_reset_password_post) | **POST** /auth/reset-password | Reset password with token
[**auth_verify_email_post**](AuthApi.md#auth_verify_email_post) | **POST** /auth/verify-email | Verify email address


# **auth2fa_confirm_post**
> auth2fa_confirm_post(confirm2fa_request)

Confirm 2FA setup with a code

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.confirm2fa_request import Confirm2faRequest
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
    api_instance = hooksniff.AuthApi(api_client)
    confirm2fa_request = hooksniff.Confirm2faRequest() # Confirm2faRequest | 

    try:
        # Confirm 2FA setup with a code
        api_instance.auth2fa_confirm_post(confirm2fa_request)
    except Exception as e:
        print("Exception when calling AuthApi->auth2fa_confirm_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **confirm2fa_request** | [**Confirm2faRequest**](Confirm2faRequest.md)|  | 

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
**200** | 2FA enabled |  -  |
**400** | Invalid code |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2fa_disable_post**
> auth2fa_disable_post(disable2fa_request)

Disable 2FA

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.disable2fa_request import Disable2faRequest
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
    api_instance = hooksniff.AuthApi(api_client)
    disable2fa_request = hooksniff.Disable2faRequest() # Disable2faRequest | 

    try:
        # Disable 2FA
        api_instance.auth2fa_disable_post(disable2fa_request)
    except Exception as e:
        print("Exception when calling AuthApi->auth2fa_disable_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **disable2fa_request** | [**Disable2faRequest**](Disable2faRequest.md)|  | 

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
**200** | 2FA disabled |  -  |
**400** | Invalid password |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2fa_enable_post**
> Auth2faEnablePost200Response auth2fa_enable_post(enable2fa_request)

Enable 2FA (returns TOTP secret and QR URL)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.auth2fa_enable_post200_response import Auth2faEnablePost200Response
from hooksniff.models.enable2fa_request import Enable2faRequest
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
    api_instance = hooksniff.AuthApi(api_client)
    enable2fa_request = hooksniff.Enable2faRequest() # Enable2faRequest | 

    try:
        # Enable 2FA (returns TOTP secret and QR URL)
        api_response = api_instance.auth2fa_enable_post(enable2fa_request)
        print("The response of AuthApi->auth2fa_enable_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth2fa_enable_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **enable2fa_request** | [**Enable2faRequest**](Enable2faRequest.md)|  | 

### Return type

[**Auth2faEnablePost200Response**](Auth2faEnablePost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | TOTP secret generated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2fa_status_get**
> Auth2faStatusGet200Response auth2fa_status_get()

Get 2FA status

Returns whether 2FA is enabled for the authenticated user

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.auth2fa_status_get200_response import Auth2faStatusGet200Response
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
    api_instance = hooksniff.AuthApi(api_client)

    try:
        # Get 2FA status
        api_response = api_instance.auth2fa_status_get()
        print("The response of AuthApi->auth2fa_status_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth2fa_status_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | 2FA status |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2fa_verify_post**
> AuthResponse auth2fa_verify_post(verify2fa_request)

Verify 2FA code during login

### Example


```python
import hooksniff
from hooksniff.models.auth_response import AuthResponse
from hooksniff.models.verify2fa_request import Verify2faRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AuthApi(api_client)
    verify2fa_request = hooksniff.Verify2faRequest() # Verify2faRequest | 

    try:
        # Verify 2FA code during login
        api_response = api_instance.auth2fa_verify_post(verify2fa_request)
        print("The response of AuthApi->auth2fa_verify_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth2fa_verify_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **verify2fa_request** | [**Verify2faRequest**](Verify2faRequest.md)|  | 

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | 2FA verified, full token issued |  -  |
**401** | Invalid code |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_account_delete**
> auth_account_delete()

Delete account (GDPR)

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
    api_instance = hooksniff.AuthApi(api_client)

    try:
        # Delete account (GDPR)
        api_instance.auth_account_delete()
    except Exception as e:
        print("Exception when calling AuthApi->auth_account_delete: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Account deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_consent_get**
> AuthConsentGet200Response auth_consent_get()

Get consent preferences

Returns the authenticated user's consent preferences

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.auth_consent_get200_response import AuthConsentGet200Response
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
    api_instance = hooksniff.AuthApi(api_client)

    try:
        # Get consent preferences
        api_response = api_instance.auth_consent_get()
        print("The response of AuthApi->auth_consent_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth_consent_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Consent preferences |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_consent_post**
> AuthConsentPost200Response auth_consent_post(auth_consent_post_request)

Update a consent preference

Sets a single consent key to true/false

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.auth_consent_post200_response import AuthConsentPost200Response
from hooksniff.models.auth_consent_post_request import AuthConsentPostRequest
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
    api_instance = hooksniff.AuthApi(api_client)
    auth_consent_post_request = hooksniff.AuthConsentPostRequest() # AuthConsentPostRequest | 

    try:
        # Update a consent preference
        api_response = api_instance.auth_consent_post(auth_consent_post_request)
        print("The response of AuthApi->auth_consent_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth_consent_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **auth_consent_post_request** | [**AuthConsentPostRequest**](AuthConsentPostRequest.md)|  | 

### Return type

[**AuthConsentPost200Response**](AuthConsentPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Consent updated |  -  |
**400** | Missing key or value |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_export_get**
> auth_export_get()

Export user data (GDPR)

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
    api_instance = hooksniff.AuthApi(api_client)

    try:
        # Export user data (GDPR)
        api_instance.auth_export_get()
    except Exception as e:
        print("Exception when calling AuthApi->auth_export_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | User data export |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_forgot_password_post**
> auth_forgot_password_post(forgot_password_request)

Request password reset email

### Example


```python
import hooksniff
from hooksniff.models.forgot_password_request import ForgotPasswordRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AuthApi(api_client)
    forgot_password_request = hooksniff.ForgotPasswordRequest() # ForgotPasswordRequest | 

    try:
        # Request password reset email
        api_instance.auth_forgot_password_post(forgot_password_request)
    except Exception as e:
        print("Exception when calling AuthApi->auth_forgot_password_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **forgot_password_request** | [**ForgotPasswordRequest**](ForgotPasswordRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Reset email sent (if account exists) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_login_post**
> AuthLoginPost200Response auth_login_post(login_request)

Login with email and password

### Example


```python
import hooksniff
from hooksniff.models.auth_login_post200_response import AuthLoginPost200Response
from hooksniff.models.login_request import LoginRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AuthApi(api_client)
    login_request = hooksniff.LoginRequest() # LoginRequest | 

    try:
        # Login with email and password
        api_response = api_instance.auth_login_post(login_request)
        print("The response of AuthApi->auth_login_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth_login_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **login_request** | [**LoginRequest**](LoginRequest.md)|  | 

### Return type

[**AuthLoginPost200Response**](AuthLoginPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Login successful (or 2FA required) |  -  |
**401** | Invalid credentials |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_logout_post**
> auth_logout_post()

Logout (invalidate refresh token)

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
    api_instance = hooksniff.AuthApi(api_client)

    try:
        # Logout (invalidate refresh token)
        api_instance.auth_logout_post()
    except Exception as e:
        print("Exception when calling AuthApi->auth_logout_post: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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
**200** | Logged out |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_me_get**
> CustomerResponse auth_me_get()

Get current user profile

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.customer_response import CustomerResponse
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
    api_instance = hooksniff.AuthApi(api_client)

    try:
        # Get current user profile
        api_response = api_instance.auth_me_get()
        print("The response of AuthApi->auth_me_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth_me_get: %s\n" % e)
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

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Current user |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_password_put**
> auth_password_put(change_password_request)

Change password

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.change_password_request import ChangePasswordRequest
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
    api_instance = hooksniff.AuthApi(api_client)
    change_password_request = hooksniff.ChangePasswordRequest() # ChangePasswordRequest | 

    try:
        # Change password
        api_instance.auth_password_put(change_password_request)
    except Exception as e:
        print("Exception when calling AuthApi->auth_password_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **change_password_request** | [**ChangePasswordRequest**](ChangePasswordRequest.md)|  | 

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
**200** | Password changed |  -  |
**400** | Current password incorrect |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_profile_put**
> CustomerResponse auth_profile_put(update_profile_request)

Update profile

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.customer_response import CustomerResponse
from hooksniff.models.update_profile_request import UpdateProfileRequest
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
    api_instance = hooksniff.AuthApi(api_client)
    update_profile_request = hooksniff.UpdateProfileRequest() # UpdateProfileRequest | 

    try:
        # Update profile
        api_response = api_instance.auth_profile_put(update_profile_request)
        print("The response of AuthApi->auth_profile_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth_profile_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **update_profile_request** | [**UpdateProfileRequest**](UpdateProfileRequest.md)|  | 

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Profile updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_refresh_post**
> AuthResponse auth_refresh_post(refresh_token_request)

Refresh access token

### Example


```python
import hooksniff
from hooksniff.models.auth_response import AuthResponse
from hooksniff.models.refresh_token_request import RefreshTokenRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AuthApi(api_client)
    refresh_token_request = hooksniff.RefreshTokenRequest() # RefreshTokenRequest | 

    try:
        # Refresh access token
        api_response = api_instance.auth_refresh_post(refresh_token_request)
        print("The response of AuthApi->auth_refresh_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth_refresh_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **refresh_token_request** | [**RefreshTokenRequest**](RefreshTokenRequest.md)|  | 

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | New tokens issued |  -  |
**401** | Invalid refresh token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_register_post**
> CustomerResponse auth_register_post(register_request)

Register a new account

### Example


```python
import hooksniff
from hooksniff.models.customer_response import CustomerResponse
from hooksniff.models.register_request import RegisterRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AuthApi(api_client)
    register_request = hooksniff.RegisterRequest() # RegisterRequest | 

    try:
        # Register a new account
        api_response = api_instance.auth_register_post(register_request)
        print("The response of AuthApi->auth_register_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling AuthApi->auth_register_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **register_request** | [**RegisterRequest**](RegisterRequest.md)|  | 

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Account created |  -  |
**400** | Validation error |  -  |
**409** | Email already exists |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_resend_verification_post**
> auth_resend_verification_post(resend_verification_request)

Resend verification email

### Example


```python
import hooksniff
from hooksniff.models.resend_verification_request import ResendVerificationRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AuthApi(api_client)
    resend_verification_request = hooksniff.ResendVerificationRequest() # ResendVerificationRequest | 

    try:
        # Resend verification email
        api_instance.auth_resend_verification_post(resend_verification_request)
    except Exception as e:
        print("Exception when calling AuthApi->auth_resend_verification_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **resend_verification_request** | [**ResendVerificationRequest**](ResendVerificationRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Verification email sent (if account exists and unverified) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_reset_password_post**
> auth_reset_password_post(reset_password_request)

Reset password with token

### Example


```python
import hooksniff
from hooksniff.models.reset_password_request import ResetPasswordRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AuthApi(api_client)
    reset_password_request = hooksniff.ResetPasswordRequest() # ResetPasswordRequest | 

    try:
        # Reset password with token
        api_instance.auth_reset_password_post(reset_password_request)
    except Exception as e:
        print("Exception when calling AuthApi->auth_reset_password_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **reset_password_request** | [**ResetPasswordRequest**](ResetPasswordRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Password reset successful |  -  |
**400** | Invalid or expired token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth_verify_email_post**
> auth_verify_email_post(verify_email_request)

Verify email address

### Example


```python
import hooksniff
from hooksniff.models.verify_email_request import VerifyEmailRequest
from hooksniff.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to https://hooksniff-api-1046140057667.europe-west1.run.app/v1
# See configuration.py for a list of all supported configuration parameters.
configuration = hooksniff.Configuration(
    host = "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
)


# Enter a context with an instance of the API client
with hooksniff.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = hooksniff.AuthApi(api_client)
    verify_email_request = hooksniff.VerifyEmailRequest() # VerifyEmailRequest | 

    try:
        # Verify email address
        api_instance.auth_verify_email_post(verify_email_request)
    except Exception as e:
        print("Exception when calling AuthApi->auth_verify_email_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **verify_email_request** | [**VerifyEmailRequest**](VerifyEmailRequest.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Email verified |  -  |
**400** | Invalid token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

