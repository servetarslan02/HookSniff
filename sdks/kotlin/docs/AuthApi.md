# AuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
| ------------- | ------------- | ------------- |
| [**auth2faConfirmPost**](AuthApi.md#auth2faConfirmPost) | **POST** /auth/2fa/confirm | Confirm 2FA setup with a code |
| [**auth2faDisablePost**](AuthApi.md#auth2faDisablePost) | **POST** /auth/2fa/disable | Disable 2FA |
| [**auth2faEnablePost**](AuthApi.md#auth2faEnablePost) | **POST** /auth/2fa/enable | Enable 2FA (returns TOTP secret and QR URL) |
| [**auth2faStatusGet**](AuthApi.md#auth2faStatusGet) | **GET** /auth/2fa/status | Get 2FA status |
| [**auth2faVerifyPost**](AuthApi.md#auth2faVerifyPost) | **POST** /auth/2fa/verify | Verify 2FA code during login |
| [**authAccountDelete**](AuthApi.md#authAccountDelete) | **DELETE** /auth/account | Delete account (GDPR) |
| [**authConsentGet**](AuthApi.md#authConsentGet) | **GET** /auth/consent | Get consent preferences |
| [**authConsentPost**](AuthApi.md#authConsentPost) | **POST** /auth/consent | Update a consent preference |
| [**authExportGet**](AuthApi.md#authExportGet) | **GET** /auth/export | Export user data (GDPR) |
| [**authForgotPasswordPost**](AuthApi.md#authForgotPasswordPost) | **POST** /auth/forgot-password | Request password reset email |
| [**authLoginPost**](AuthApi.md#authLoginPost) | **POST** /auth/login | Login with email and password |
| [**authLogoutPost**](AuthApi.md#authLogoutPost) | **POST** /auth/logout | Logout (invalidate refresh token) |
| [**authMeGet**](AuthApi.md#authMeGet) | **GET** /auth/me | Get current user profile |
| [**authPasswordPut**](AuthApi.md#authPasswordPut) | **PUT** /auth/password | Change password |
| [**authProfilePut**](AuthApi.md#authProfilePut) | **PUT** /auth/profile | Update profile |
| [**authRefreshPost**](AuthApi.md#authRefreshPost) | **POST** /auth/refresh | Refresh access token |
| [**authRegisterPost**](AuthApi.md#authRegisterPost) | **POST** /auth/register | Register a new account |
| [**authResendVerificationPost**](AuthApi.md#authResendVerificationPost) | **POST** /auth/resend-verification | Resend verification email |
| [**authResetPasswordPost**](AuthApi.md#authResetPasswordPost) | **POST** /auth/reset-password | Reset password with token |
| [**authVerifyEmailPost**](AuthApi.md#authVerifyEmailPost) | **POST** /auth/verify-email | Verify email address |


<a id="auth2faConfirmPost"></a>
# **auth2faConfirmPost**
> auth2faConfirmPost(confirm2faRequest)

Confirm 2FA setup with a code

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val confirm2faRequest : Confirm2faRequest =  // Confirm2faRequest | 
try {
    apiInstance.auth2faConfirmPost(confirm2faRequest)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#auth2faConfirmPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#auth2faConfirmPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **confirm2faRequest** | [**Confirm2faRequest**](Confirm2faRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="auth2faDisablePost"></a>
# **auth2faDisablePost**
> auth2faDisablePost(disable2faRequest)

Disable 2FA

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val disable2faRequest : Disable2faRequest =  // Disable2faRequest | 
try {
    apiInstance.auth2faDisablePost(disable2faRequest)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#auth2faDisablePost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#auth2faDisablePost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **disable2faRequest** | [**Disable2faRequest**](Disable2faRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="auth2faEnablePost"></a>
# **auth2faEnablePost**
> Auth2faEnablePost200Response auth2faEnablePost(enable2faRequest)

Enable 2FA (returns TOTP secret and QR URL)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val enable2faRequest : Enable2faRequest =  // Enable2faRequest | 
try {
    val result : Auth2faEnablePost200Response = apiInstance.auth2faEnablePost(enable2faRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#auth2faEnablePost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#auth2faEnablePost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **enable2faRequest** | [**Enable2faRequest**](Enable2faRequest.md)|  | |

### Return type

[**Auth2faEnablePost200Response**](Auth2faEnablePost200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="auth2faStatusGet"></a>
# **auth2faStatusGet**
> Auth2faStatusGet200Response auth2faStatusGet()

Get 2FA status

Returns whether 2FA is enabled for the authenticated user

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
try {
    val result : Auth2faStatusGet200Response = apiInstance.auth2faStatusGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#auth2faStatusGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#auth2faStatusGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**Auth2faStatusGet200Response**](Auth2faStatusGet200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="auth2faVerifyPost"></a>
# **auth2faVerifyPost**
> AuthResponse auth2faVerifyPost(verify2faRequest)

Verify 2FA code during login

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val verify2faRequest : Verify2faRequest =  // Verify2faRequest | 
try {
    val result : AuthResponse = apiInstance.auth2faVerifyPost(verify2faRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#auth2faVerifyPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#auth2faVerifyPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **verify2faRequest** | [**Verify2faRequest**](Verify2faRequest.md)|  | |

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="authAccountDelete"></a>
# **authAccountDelete**
> authAccountDelete()

Delete account (GDPR)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
try {
    apiInstance.authAccountDelete()
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authAccountDelete")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authAccountDelete")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="authConsentGet"></a>
# **authConsentGet**
> AuthConsentGet200Response authConsentGet()

Get consent preferences

Returns the authenticated user&#39;s consent preferences

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
try {
    val result : AuthConsentGet200Response = apiInstance.authConsentGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authConsentGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authConsentGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**AuthConsentGet200Response**](AuthConsentGet200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="authConsentPost"></a>
# **authConsentPost**
> AuthConsentPost200Response authConsentPost(authConsentPostRequest)

Update a consent preference

Sets a single consent key to true/false

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val authConsentPostRequest : AuthConsentPostRequest =  // AuthConsentPostRequest | 
try {
    val result : AuthConsentPost200Response = apiInstance.authConsentPost(authConsentPostRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authConsentPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authConsentPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **authConsentPostRequest** | [**AuthConsentPostRequest**](AuthConsentPostRequest.md)|  | |

### Return type

[**AuthConsentPost200Response**](AuthConsentPost200Response.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="authExportGet"></a>
# **authExportGet**
> authExportGet()

Export user data (GDPR)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
try {
    apiInstance.authExportGet()
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authExportGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authExportGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="authForgotPasswordPost"></a>
# **authForgotPasswordPost**
> authForgotPasswordPost(forgotPasswordRequest)

Request password reset email

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val forgotPasswordRequest : ForgotPasswordRequest =  // ForgotPasswordRequest | 
try {
    apiInstance.authForgotPasswordPost(forgotPasswordRequest)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authForgotPasswordPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authForgotPasswordPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **forgotPasswordRequest** | [**ForgotPasswordRequest**](ForgotPasswordRequest.md)|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="authLoginPost"></a>
# **authLoginPost**
> AuthLoginPost200Response authLoginPost(loginRequest)

Login with email and password

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val loginRequest : LoginRequest =  // LoginRequest | 
try {
    val result : AuthLoginPost200Response = apiInstance.authLoginPost(loginRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authLoginPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authLoginPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **loginRequest** | [**LoginRequest**](LoginRequest.md)|  | |

### Return type

[**AuthLoginPost200Response**](AuthLoginPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="authLogoutPost"></a>
# **authLogoutPost**
> authLogoutPost()

Logout (invalidate refresh token)

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
try {
    apiInstance.authLogoutPost()
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authLogoutPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authLogoutPost")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

<a id="authMeGet"></a>
# **authMeGet**
> CustomerResponse authMeGet()

Get current user profile

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
try {
    val result : CustomerResponse = apiInstance.authMeGet()
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authMeGet")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authMeGet")
    e.printStackTrace()
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

<a id="authPasswordPut"></a>
# **authPasswordPut**
> authPasswordPut(changePasswordRequest)

Change password

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val changePasswordRequest : ChangePasswordRequest =  // ChangePasswordRequest | 
try {
    apiInstance.authPasswordPut(changePasswordRequest)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authPasswordPut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authPasswordPut")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **changePasswordRequest** | [**ChangePasswordRequest**](ChangePasswordRequest.md)|  | |

### Return type

null (empty response body)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="authProfilePut"></a>
# **authProfilePut**
> CustomerResponse authProfilePut(updateProfileRequest)

Update profile

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val updateProfileRequest : UpdateProfileRequest =  // UpdateProfileRequest | 
try {
    val result : CustomerResponse = apiInstance.authProfilePut(updateProfileRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authProfilePut")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authProfilePut")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **updateProfileRequest** | [**UpdateProfileRequest**](UpdateProfileRequest.md)|  | |

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization


Configure BearerAuth:
    ApiClient.accessToken = ""

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="authRefreshPost"></a>
# **authRefreshPost**
> AuthResponse authRefreshPost(refreshTokenRequest)

Refresh access token

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val refreshTokenRequest : RefreshTokenRequest =  // RefreshTokenRequest | 
try {
    val result : AuthResponse = apiInstance.authRefreshPost(refreshTokenRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authRefreshPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authRefreshPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **refreshTokenRequest** | [**RefreshTokenRequest**](RefreshTokenRequest.md)|  | |

### Return type

[**AuthResponse**](AuthResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="authRegisterPost"></a>
# **authRegisterPost**
> CustomerResponse authRegisterPost(registerRequest)

Register a new account

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val registerRequest : RegisterRequest =  // RegisterRequest | 
try {
    val result : CustomerResponse = apiInstance.authRegisterPost(registerRequest)
    println(result)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authRegisterPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authRegisterPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **registerRequest** | [**RegisterRequest**](RegisterRequest.md)|  | |

### Return type

[**CustomerResponse**](CustomerResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

<a id="authResendVerificationPost"></a>
# **authResendVerificationPost**
> authResendVerificationPost(resendVerificationRequest)

Resend verification email

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val resendVerificationRequest : ResendVerificationRequest =  // ResendVerificationRequest | 
try {
    apiInstance.authResendVerificationPost(resendVerificationRequest)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authResendVerificationPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authResendVerificationPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **resendVerificationRequest** | [**ResendVerificationRequest**](ResendVerificationRequest.md)|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="authResetPasswordPost"></a>
# **authResetPasswordPost**
> authResetPasswordPost(resetPasswordRequest)

Reset password with token

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val resetPasswordRequest : ResetPasswordRequest =  // ResetPasswordRequest | 
try {
    apiInstance.authResetPasswordPost(resetPasswordRequest)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authResetPasswordPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authResetPasswordPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **resetPasswordRequest** | [**ResetPasswordRequest**](ResetPasswordRequest.md)|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

<a id="authVerifyEmailPost"></a>
# **authVerifyEmailPost**
> authVerifyEmailPost(verifyEmailRequest)

Verify email address

### Example
```kotlin
// Import classes:
//import hooksniff.infrastructure.*
//import hooksniff.models.*

val apiInstance = AuthApi()
val verifyEmailRequest : VerifyEmailRequest =  // VerifyEmailRequest | 
try {
    apiInstance.authVerifyEmailPost(verifyEmailRequest)
} catch (e: ClientException) {
    println("4xx response calling AuthApi#authVerifyEmailPost")
    e.printStackTrace()
} catch (e: ServerException) {
    println("5xx response calling AuthApi#authVerifyEmailPost")
    e.printStackTrace()
}
```

### Parameters
| Name | Type | Description  | Notes |
| ------------- | ------------- | ------------- | ------------- |
| **verifyEmailRequest** | [**VerifyEmailRequest**](VerifyEmailRequest.md)|  | |

### Return type

null (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

