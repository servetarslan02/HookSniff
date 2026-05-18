# AuthAPI

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**auth2faConfirmPost**](AuthAPI.md#auth2faconfirmpost) | **POST** /auth/2fa/confirm | Confirm 2FA setup with a code
[**auth2faDisablePost**](AuthAPI.md#auth2fadisablepost) | **POST** /auth/2fa/disable | Disable 2FA
[**auth2faEnablePost**](AuthAPI.md#auth2faenablepost) | **POST** /auth/2fa/enable | Enable 2FA (returns TOTP secret and QR URL)
[**auth2faVerifyPost**](AuthAPI.md#auth2faverifypost) | **POST** /auth/2fa/verify | Verify 2FA code during login
[**authAccountDelete**](AuthAPI.md#authaccountdelete) | **DELETE** /auth/account | Delete account (GDPR)
[**authExportGet**](AuthAPI.md#authexportget) | **GET** /auth/export | Export user data (GDPR)
[**authForgotPasswordPost**](AuthAPI.md#authforgotpasswordpost) | **POST** /auth/forgot-password | Request password reset email
[**authLoginPost**](AuthAPI.md#authloginpost) | **POST** /auth/login | Login with email and password
[**authLogoutPost**](AuthAPI.md#authlogoutpost) | **POST** /auth/logout | Logout (invalidate refresh token)
[**authMeGet**](AuthAPI.md#authmeget) | **GET** /auth/me | Get current user profile
[**authPasswordPut**](AuthAPI.md#authpasswordput) | **PUT** /auth/password | Change password
[**authProfilePut**](AuthAPI.md#authprofileput) | **PUT** /auth/profile | Update profile
[**authRefreshPost**](AuthAPI.md#authrefreshpost) | **POST** /auth/refresh | Refresh access token
[**authRegisterPost**](AuthAPI.md#authregisterpost) | **POST** /auth/register | Register a new account
[**authResendVerificationPost**](AuthAPI.md#authresendverificationpost) | **POST** /auth/resend-verification | Resend verification email
[**authResetPasswordPost**](AuthAPI.md#authresetpasswordpost) | **POST** /auth/reset-password | Reset password with token
[**authVerifyEmailPost**](AuthAPI.md#authverifyemailpost) | **POST** /auth/verify-email | Verify email address


# **auth2faConfirmPost**
```swift
    open class func auth2faConfirmPost(confirm2faRequest: Confirm2faRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Confirm 2FA setup with a code

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let confirm2faRequest = Confirm2faRequest(code: "code_example") // Confirm2faRequest | 

// Confirm 2FA setup with a code
AuthAPI.auth2faConfirmPost(confirm2faRequest: confirm2faRequest) { (response, error) in
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
 **confirm2faRequest** | [**Confirm2faRequest**](Confirm2faRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2faDisablePost**
```swift
    open class func auth2faDisablePost(disable2faRequest: Disable2faRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Disable 2FA

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let disable2faRequest = Disable2faRequest(password: "password_example") // Disable2faRequest | 

// Disable 2FA
AuthAPI.auth2faDisablePost(disable2faRequest: disable2faRequest) { (response, error) in
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
 **disable2faRequest** | [**Disable2faRequest**](Disable2faRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2faEnablePost**
```swift
    open class func auth2faEnablePost(enable2faRequest: Enable2faRequest, completion: @escaping (_ data: Auth2faEnablePost200Response?, _ error: Error?) -> Void)
```

Enable 2FA (returns TOTP secret and QR URL)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let enable2faRequest = Enable2faRequest(password: "password_example") // Enable2faRequest | 

// Enable 2FA (returns TOTP secret and QR URL)
AuthAPI.auth2faEnablePost(enable2faRequest: enable2faRequest) { (response, error) in
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
 **enable2faRequest** | [**Enable2faRequest**](Enable2faRequest.md) |  | 

### Return type

[**Auth2faEnablePost200Response**](Auth2faEnablePost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **auth2faVerifyPost**
```swift
    open class func auth2faVerifyPost(verify2faRequest: Verify2faRequest, completion: @escaping (_ data: AuthResponse?, _ error: Error?) -> Void)
```

Verify 2FA code during login

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let verify2faRequest = Verify2faRequest(tempToken: "tempToken_example", code: "code_example") // Verify2faRequest | 

// Verify 2FA code during login
AuthAPI.auth2faVerifyPost(verify2faRequest: verify2faRequest) { (response, error) in
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
 **verify2faRequest** | [**Verify2faRequest**](Verify2faRequest.md) |  | 

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authAccountDelete**
```swift
    open class func authAccountDelete(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Delete account (GDPR)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Delete account (GDPR)
AuthAPI.authAccountDelete() { (response, error) in
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

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authExportGet**
```swift
    open class func authExportGet(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Export user data (GDPR)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Export user data (GDPR)
AuthAPI.authExportGet() { (response, error) in
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

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authForgotPasswordPost**
```swift
    open class func authForgotPasswordPost(forgotPasswordRequest: ForgotPasswordRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Request password reset email

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let forgotPasswordRequest = ForgotPasswordRequest(email: "email_example") // ForgotPasswordRequest | 

// Request password reset email
AuthAPI.authForgotPasswordPost(forgotPasswordRequest: forgotPasswordRequest) { (response, error) in
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
 **forgotPasswordRequest** | [**ForgotPasswordRequest**](ForgotPasswordRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authLoginPost**
```swift
    open class func authLoginPost(loginRequest: LoginRequest, completion: @escaping (_ data: AuthLoginPost200Response?, _ error: Error?) -> Void)
```

Login with email and password

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let loginRequest = LoginRequest(email: "email_example", password: "password_example") // LoginRequest | 

// Login with email and password
AuthAPI.authLoginPost(loginRequest: loginRequest) { (response, error) in
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
 **loginRequest** | [**LoginRequest**](LoginRequest.md) |  | 

### Return type

[**AuthLoginPost200Response**](AuthLoginPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authLogoutPost**
```swift
    open class func authLogoutPost(completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Logout (invalidate refresh token)

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Logout (invalidate refresh token)
AuthAPI.authLogoutPost() { (response, error) in
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

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authMeGet**
```swift
    open class func authMeGet(completion: @escaping (_ data: CustomerResponse?, _ error: Error?) -> Void)
```

Get current user profile

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient


// Get current user profile
AuthAPI.authMeGet() { (response, error) in
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

[**CustomerResponse**](CustomerResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authPasswordPut**
```swift
    open class func authPasswordPut(changePasswordRequest: ChangePasswordRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Change password

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let changePasswordRequest = ChangePasswordRequest(currentPassword: "currentPassword_example", newPassword: "newPassword_example") // ChangePasswordRequest | 

// Change password
AuthAPI.authPasswordPut(changePasswordRequest: changePasswordRequest) { (response, error) in
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
 **changePasswordRequest** | [**ChangePasswordRequest**](ChangePasswordRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authProfilePut**
```swift
    open class func authProfilePut(updateProfileRequest: UpdateProfileRequest, completion: @escaping (_ data: CustomerResponse?, _ error: Error?) -> Void)
```

Update profile

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let updateProfileRequest = UpdateProfileRequest(name: "name_example", email: "email_example") // UpdateProfileRequest | 

// Update profile
AuthAPI.authProfilePut(updateProfileRequest: updateProfileRequest) { (response, error) in
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
 **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md) |  | 

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authRefreshPost**
```swift
    open class func authRefreshPost(refreshTokenRequest: RefreshTokenRequest, completion: @escaping (_ data: AuthResponse?, _ error: Error?) -> Void)
```

Refresh access token

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let refreshTokenRequest = RefreshTokenRequest(refreshToken: "refreshToken_example") // RefreshTokenRequest | 

// Refresh access token
AuthAPI.authRefreshPost(refreshTokenRequest: refreshTokenRequest) { (response, error) in
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
 **refreshTokenRequest** | [**RefreshTokenRequest**](RefreshTokenRequest.md) |  | 

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authRegisterPost**
```swift
    open class func authRegisterPost(registerRequest: RegisterRequest, completion: @escaping (_ data: CustomerResponse?, _ error: Error?) -> Void)
```

Register a new account

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let registerRequest = RegisterRequest(email: "email_example", password: "password_example", name: "name_example") // RegisterRequest | 

// Register a new account
AuthAPI.authRegisterPost(registerRequest: registerRequest) { (response, error) in
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
 **registerRequest** | [**RegisterRequest**](RegisterRequest.md) |  | 

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authResendVerificationPost**
```swift
    open class func authResendVerificationPost(resendVerificationRequest: ResendVerificationRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Resend verification email

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let resendVerificationRequest = ResendVerificationRequest(email: "email_example") // ResendVerificationRequest | 

// Resend verification email
AuthAPI.authResendVerificationPost(resendVerificationRequest: resendVerificationRequest) { (response, error) in
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
 **resendVerificationRequest** | [**ResendVerificationRequest**](ResendVerificationRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authResetPasswordPost**
```swift
    open class func authResetPasswordPost(resetPasswordRequest: ResetPasswordRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Reset password with token

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let resetPasswordRequest = ResetPasswordRequest(token: "token_example", newPassword: "newPassword_example") // ResetPasswordRequest | 

// Reset password with token
AuthAPI.authResetPasswordPost(resetPasswordRequest: resetPasswordRequest) { (response, error) in
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
 **resetPasswordRequest** | [**ResetPasswordRequest**](ResetPasswordRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authVerifyEmailPost**
```swift
    open class func authVerifyEmailPost(verifyEmailRequest: VerifyEmailRequest, completion: @escaping (_ data: Void?, _ error: Error?) -> Void)
```

Verify email address

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let verifyEmailRequest = VerifyEmailRequest(token: "token_example") // VerifyEmailRequest | 

// Verify email address
AuthAPI.authVerifyEmailPost(verifyEmailRequest: verifyEmailRequest) { (response, error) in
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
 **verifyEmailRequest** | [**VerifyEmailRequest**](VerifyEmailRequest.md) |  | 

### Return type

Void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

