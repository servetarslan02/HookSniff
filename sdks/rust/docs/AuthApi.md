# \AuthApi

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



## auth2fa_confirm_post

> auth2fa_confirm_post(confirm2fa_request)
Confirm 2FA setup with a code

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**confirm2fa_request** | [**Confirm2faRequest**](Confirm2faRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth2fa_disable_post

> auth2fa_disable_post(disable2fa_request)
Disable 2FA

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**disable2fa_request** | [**Disable2faRequest**](Disable2faRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth2fa_enable_post

> models::Auth2faEnablePost200Response auth2fa_enable_post(enable2fa_request)
Enable 2FA (returns TOTP secret and QR URL)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**enable2fa_request** | [**Enable2faRequest**](Enable2faRequest.md) |  | [required] |

### Return type

[**models::Auth2faEnablePost200Response**](_auth_2fa_enable_post_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth2fa_status_get

> models::Auth2faStatusGet200Response auth2fa_status_get()
Get 2FA status

Returns whether 2FA is enabled for the authenticated user

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::Auth2faStatusGet200Response**](_auth_2fa_status_get_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth2fa_verify_post

> models::AuthResponse auth2fa_verify_post(verify2fa_request)
Verify 2FA code during login

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**verify2fa_request** | [**Verify2faRequest**](Verify2faRequest.md) |  | [required] |

### Return type

[**models::AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_account_delete

> auth_account_delete()
Delete account (GDPR)

### Parameters

This endpoint does not need any parameter.

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_consent_get

> models::AuthConsentGet200Response auth_consent_get()
Get consent preferences

Returns the authenticated user's consent preferences

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::AuthConsentGet200Response**](_auth_consent_get_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_consent_post

> models::AuthConsentPost200Response auth_consent_post(auth_consent_post_request)
Update a consent preference

Sets a single consent key to true/false

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**auth_consent_post_request** | [**AuthConsentPostRequest**](AuthConsentPostRequest.md) |  | [required] |

### Return type

[**models::AuthConsentPost200Response**](_auth_consent_post_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_export_get

> auth_export_get()
Export user data (GDPR)

### Parameters

This endpoint does not need any parameter.

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_forgot_password_post

> auth_forgot_password_post(forgot_password_request)
Request password reset email

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**forgot_password_request** | [**ForgotPasswordRequest**](ForgotPasswordRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_login_post

> models::AuthLoginPost200Response auth_login_post(login_request)
Login with email and password

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**login_request** | [**LoginRequest**](LoginRequest.md) |  | [required] |

### Return type

[**models::AuthLoginPost200Response**](_auth_login_post_200_response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_logout_post

> auth_logout_post()
Logout (invalidate refresh token)

### Parameters

This endpoint does not need any parameter.

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_me_get

> models::CustomerResponse auth_me_get()
Get current user profile

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::CustomerResponse**](CustomerResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_password_put

> auth_password_put(change_password_request)
Change password

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**change_password_request** | [**ChangePasswordRequest**](ChangePasswordRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_profile_put

> models::CustomerResponse auth_profile_put(update_profile_request)
Update profile

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**update_profile_request** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  | [required] |

### Return type

[**models::CustomerResponse**](CustomerResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_refresh_post

> models::AuthResponse auth_refresh_post(refresh_token_request)
Refresh access token

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**refresh_token_request** | [**RefreshTokenRequest**](RefreshTokenRequest.md) |  | [required] |

### Return type

[**models::AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_register_post

> models::CustomerResponse auth_register_post(register_request)
Register a new account

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**register_request** | [**RegisterRequest**](RegisterRequest.md) |  | [required] |

### Return type

[**models::CustomerResponse**](CustomerResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_resend_verification_post

> auth_resend_verification_post(resend_verification_request)
Resend verification email

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**resend_verification_request** | [**ResendVerificationRequest**](ResendVerificationRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_reset_password_post

> auth_reset_password_post(reset_password_request)
Reset password with token

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**reset_password_request** | [**ResetPasswordRequest**](ResetPasswordRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## auth_verify_email_post

> auth_verify_email_post(verify_email_request)
Verify email address

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**verify_email_request** | [**VerifyEmailRequest**](VerifyEmailRequest.md) |  | [required] |

### Return type

 (empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

