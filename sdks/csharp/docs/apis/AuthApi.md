# hooksniff.Api.AuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**Auth2faConfirmPost**](AuthApi.md#auth2faconfirmpost) | **POST** /auth/2fa/confirm | Confirm 2FA setup with a code |
| [**Auth2faDisablePost**](AuthApi.md#auth2fadisablepost) | **POST** /auth/2fa/disable | Disable 2FA |
| [**Auth2faEnablePost**](AuthApi.md#auth2faenablepost) | **POST** /auth/2fa/enable | Enable 2FA (returns TOTP secret and QR URL) |
| [**Auth2faStatusGet**](AuthApi.md#auth2fastatusget) | **GET** /auth/2fa/status | Get 2FA status |
| [**Auth2faVerifyPost**](AuthApi.md#auth2faverifypost) | **POST** /auth/2fa/verify | Verify 2FA code during login |
| [**AuthAccountDelete**](AuthApi.md#authaccountdelete) | **DELETE** /auth/account | Delete account (GDPR) |
| [**AuthConsentGet**](AuthApi.md#authconsentget) | **GET** /auth/consent | Get consent preferences |
| [**AuthConsentPost**](AuthApi.md#authconsentpost) | **POST** /auth/consent | Update a consent preference |
| [**AuthExportGet**](AuthApi.md#authexportget) | **GET** /auth/export | Export user data (GDPR) |
| [**AuthForgotPasswordPost**](AuthApi.md#authforgotpasswordpost) | **POST** /auth/forgot-password | Request password reset email |
| [**AuthLoginPost**](AuthApi.md#authloginpost) | **POST** /auth/login | Login with email and password |
| [**AuthLogoutPost**](AuthApi.md#authlogoutpost) | **POST** /auth/logout | Logout (invalidate refresh token) |
| [**AuthMeGet**](AuthApi.md#authmeget) | **GET** /auth/me | Get current user profile |
| [**AuthPasswordPut**](AuthApi.md#authpasswordput) | **PUT** /auth/password | Change password |
| [**AuthProfilePut**](AuthApi.md#authprofileput) | **PUT** /auth/profile | Update profile |
| [**AuthRefreshPost**](AuthApi.md#authrefreshpost) | **POST** /auth/refresh | Refresh access token |
| [**AuthRegisterPost**](AuthApi.md#authregisterpost) | **POST** /auth/register | Register a new account |
| [**AuthResendVerificationPost**](AuthApi.md#authresendverificationpost) | **POST** /auth/resend-verification | Resend verification email |
| [**AuthResetPasswordPost**](AuthApi.md#authresetpasswordpost) | **POST** /auth/reset-password | Reset password with token |
| [**AuthVerifyEmailPost**](AuthApi.md#authverifyemailpost) | **POST** /auth/verify-email | Verify email address |

<a id="auth2faconfirmpost"></a>
# **Auth2faConfirmPost**
> void Auth2faConfirmPost (Confirm2faRequest confirm2faRequest)

Confirm 2FA setup with a code


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **confirm2faRequest** | [**Confirm2faRequest**](Confirm2faRequest.md) |  |  |

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
| **200** | 2FA enabled |  -  |
| **400** | Invalid code |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="auth2fadisablepost"></a>
# **Auth2faDisablePost**
> void Auth2faDisablePost (Disable2faRequest disable2faRequest)

Disable 2FA


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **disable2faRequest** | [**Disable2faRequest**](Disable2faRequest.md) |  |  |

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
| **200** | 2FA disabled |  -  |
| **400** | Invalid password |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="auth2faenablepost"></a>
# **Auth2faEnablePost**
> Auth2faEnablePost200Response Auth2faEnablePost (Enable2faRequest enable2faRequest)

Enable 2FA (returns TOTP secret and QR URL)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **enable2faRequest** | [**Enable2faRequest**](Enable2faRequest.md) |  |  |

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
| **200** | TOTP secret generated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="auth2fastatusget"></a>
# **Auth2faStatusGet**
> Auth2faStatusGet200Response Auth2faStatusGet ()

Get 2FA status

Returns whether 2FA is enabled for the authenticated user


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
| **200** | 2FA status |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="auth2faverifypost"></a>
# **Auth2faVerifyPost**
> AuthResponse Auth2faVerifyPost (Verify2faRequest verify2faRequest)

Verify 2FA code during login


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **verify2faRequest** | [**Verify2faRequest**](Verify2faRequest.md) |  |  |

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
| **200** | 2FA verified, full token issued |  -  |
| **401** | Invalid code |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authaccountdelete"></a>
# **AuthAccountDelete**
> void AuthAccountDelete ()

Delete account (GDPR)


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
| **200** | Account deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authconsentget"></a>
# **AuthConsentGet**
> AuthConsentGet200Response AuthConsentGet ()

Get consent preferences

Returns the authenticated user's consent preferences


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
| **200** | Consent preferences |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authconsentpost"></a>
# **AuthConsentPost**
> AuthConsentPost200Response AuthConsentPost (AuthConsentPostRequest authConsentPostRequest)

Update a consent preference

Sets a single consent key to true/false


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **authConsentPostRequest** | [**AuthConsentPostRequest**](AuthConsentPostRequest.md) |  |  |

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
| **200** | Consent updated |  -  |
| **400** | Missing key or value |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authexportget"></a>
# **AuthExportGet**
> void AuthExportGet ()

Export user data (GDPR)


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
| **200** | User data export |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authforgotpasswordpost"></a>
# **AuthForgotPasswordPost**
> void AuthForgotPasswordPost (ForgotPasswordRequest forgotPasswordRequest)

Request password reset email


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **forgotPasswordRequest** | [**ForgotPasswordRequest**](ForgotPasswordRequest.md) |  |  |

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
| **200** | Reset email sent (if account exists) |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authloginpost"></a>
# **AuthLoginPost**
> AuthLoginPost200Response AuthLoginPost (LoginRequest loginRequest)

Login with email and password


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **loginRequest** | [**LoginRequest**](LoginRequest.md) |  |  |

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
| **200** | Login successful (or 2FA required) |  -  |
| **401** | Invalid credentials |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authlogoutpost"></a>
# **AuthLogoutPost**
> void AuthLogoutPost ()

Logout (invalidate refresh token)


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
| **200** | Logged out |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authmeget"></a>
# **AuthMeGet**
> CustomerResponse AuthMeGet ()

Get current user profile


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
| **200** | Current user |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authpasswordput"></a>
# **AuthPasswordPut**
> void AuthPasswordPut (ChangePasswordRequest changePasswordRequest)

Change password


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **changePasswordRequest** | [**ChangePasswordRequest**](ChangePasswordRequest.md) |  |  |

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
| **200** | Password changed |  -  |
| **400** | Current password incorrect |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authprofileput"></a>
# **AuthProfilePut**
> CustomerResponse AuthProfilePut (UpdateProfileRequest updateProfileRequest)

Update profile


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  |  |

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
| **200** | Profile updated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authrefreshpost"></a>
# **AuthRefreshPost**
> AuthResponse AuthRefreshPost (RefreshTokenRequest refreshTokenRequest)

Refresh access token


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **refreshTokenRequest** | [**RefreshTokenRequest**](RefreshTokenRequest.md) |  |  |

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
| **200** | New tokens issued |  -  |
| **401** | Invalid refresh token |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authregisterpost"></a>
# **AuthRegisterPost**
> CustomerResponse AuthRegisterPost (RegisterRequest registerRequest)

Register a new account


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **registerRequest** | [**RegisterRequest**](RegisterRequest.md) |  |  |

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
| **201** | Account created |  -  |
| **400** | Validation error |  -  |
| **409** | Email already exists |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authresendverificationpost"></a>
# **AuthResendVerificationPost**
> void AuthResendVerificationPost (ResendVerificationRequest resendVerificationRequest)

Resend verification email


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **resendVerificationRequest** | [**ResendVerificationRequest**](ResendVerificationRequest.md) |  |  |

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
| **200** | Verification email sent (if account exists and unverified) |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authresetpasswordpost"></a>
# **AuthResetPasswordPost**
> void AuthResetPasswordPost (ResetPasswordRequest resetPasswordRequest)

Reset password with token


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **resetPasswordRequest** | [**ResetPasswordRequest**](ResetPasswordRequest.md) |  |  |

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
| **200** | Password reset successful |  -  |
| **400** | Invalid or expired token |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="authverifyemailpost"></a>
# **AuthVerifyEmailPost**
> void AuthVerifyEmailPost (VerifyEmailRequest verifyEmailRequest)

Verify email address


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **verifyEmailRequest** | [**VerifyEmailRequest**](VerifyEmailRequest.md) |  |  |

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
| **200** | Email verified |  -  |
| **400** | Invalid token |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

