# OAuthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**oauthGithubCallbackGet**](OAuthApi.md#oauthGithubCallbackGet) | **GET** /oauth/github/callback | GitHub OAuth callback |
| [**oauthGithubGet**](OAuthApi.md#oauthGithubGet) | **GET** /oauth/github | GitHub OAuth login redirect |
| [**oauthGoogleCallbackGet**](OAuthApi.md#oauthGoogleCallbackGet) | **GET** /oauth/google/callback | Google OAuth callback |
| [**oauthGoogleGet**](OAuthApi.md#oauthGoogleGet) | **GET** /oauth/google | Google OAuth login redirect |
| [**oauthProvidersGet**](OAuthApi.md#oauthProvidersGet) | **GET** /oauth/providers | List available OAuth providers |


<a id="oauthGithubCallbackGet"></a>
# **oauthGithubCallbackGet**
> oauthGithubCallbackGet(code, state, error)

GitHub OAuth callback

Handles GitHub OAuth callback, creates/links account, sets auth cookies

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.OAuthApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    OAuthApi apiInstance = new OAuthApi(defaultClient);
    String code = "code_example"; // String | Authorization code from GitHub
    String state = "state_example"; // String | CSRF state token (verified against cookie)
    String error = "error_example"; // String | Error from GitHub (e.g. access_denied)
    try {
      apiInstance.oauthGithubCallbackGet(code, state, error);
    } catch (ApiException e) {
      System.err.println("Exception when calling OAuthApi#oauthGithubCallbackGet");
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
| **code** | **String**| Authorization code from GitHub | |
| **state** | **String**| CSRF state token (verified against cookie) | |
| **error** | **String**| Error from GitHub (e.g. access_denied) | [optional] |

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
| **302** | Redirect to app with auth cookies set |  -  |
| **400** | Invalid or missing authorization code |  -  |

<a id="oauthGithubGet"></a>
# **oauthGithubGet**
> oauthGithubGet()

GitHub OAuth login redirect

Redirects to GitHub OAuth consent screen with CSRF state cookie

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.OAuthApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    OAuthApi apiInstance = new OAuthApi(defaultClient);
    try {
      apiInstance.oauthGithubGet();
    } catch (ApiException e) {
      System.err.println("Exception when calling OAuthApi#oauthGithubGet");
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

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **302** | Redirect to GitHub OAuth |  -  |

<a id="oauthGoogleCallbackGet"></a>
# **oauthGoogleCallbackGet**
> oauthGoogleCallbackGet()

Google OAuth callback

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.OAuthApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    OAuthApi apiInstance = new OAuthApi(defaultClient);
    try {
      apiInstance.oauthGoogleCallbackGet();
    } catch (ApiException e) {
      System.err.println("Exception when calling OAuthApi#oauthGoogleCallbackGet");
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

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Authenticated |  -  |

<a id="oauthGoogleGet"></a>
# **oauthGoogleGet**
> oauthGoogleGet()

Google OAuth login redirect

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.OAuthApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    OAuthApi apiInstance = new OAuthApi(defaultClient);
    try {
      apiInstance.oauthGoogleGet();
    } catch (ApiException e) {
      System.err.println("Exception when calling OAuthApi#oauthGoogleGet");
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

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **302** | Redirect to Google |  -  |

<a id="oauthProvidersGet"></a>
# **oauthProvidersGet**
> oauthProvidersGet()

List available OAuth providers

### Example
```java
// Import classes:
import org.openapitools.client.ApiClient;
import org.openapitools.client.ApiException;
import org.openapitools.client.Configuration;
import org.openapitools.client.auth.*;
import org.openapitools.client.models.*;
import org.openapitools.client.api.OAuthApi;

public class Example {
  public static void main(String[] args) {
    ApiClient defaultClient = Configuration.getDefaultApiClient();
    defaultClient.setBasePath("https://hooksniff-api-1046140057667.europe-west1.run.app/v1");
    
    // Configure HTTP bearer authorization: BearerAuth
    HttpBearerAuth BearerAuth = (HttpBearerAuth) defaultClient.getAuthentication("BearerAuth");
    BearerAuth.setBearerToken("BEARER TOKEN");

    OAuthApi apiInstance = new OAuthApi(defaultClient);
    try {
      apiInstance.oauthProvidersGet();
    } catch (ApiException e) {
      System.err.println("Exception when calling OAuthApi#oauthProvidersGet");
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

null (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Provider list |  -  |

