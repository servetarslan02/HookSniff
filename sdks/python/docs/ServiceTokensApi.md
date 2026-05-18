# hooksniff.ServiceTokensApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**service_tokens_get**](ServiceTokensApi.md#service_tokens_get) | **GET** /service-tokens | List service tokens
[**service_tokens_id_delete**](ServiceTokensApi.md#service_tokens_id_delete) | **DELETE** /service-tokens/{id} | Delete service token
[**service_tokens_id_put**](ServiceTokensApi.md#service_tokens_id_put) | **PUT** /service-tokens/{id} | Update service token
[**service_tokens_id_reveal_post**](ServiceTokensApi.md#service_tokens_id_reveal_post) | **POST** /service-tokens/{id}/reveal | Reveal service token
[**service_tokens_post**](ServiceTokensApi.md#service_tokens_post) | **POST** /service-tokens | Create a service token


# **service_tokens_get**
> List[ServiceToken] service_tokens_get()

List service tokens

Returns all service tokens for the authenticated user

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.service_token import ServiceToken
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
    api_instance = hooksniff.ServiceTokensApi(api_client)

    try:
        # List service tokens
        api_response = api_instance.service_tokens_get()
        print("The response of ServiceTokensApi->service_tokens_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ServiceTokensApi->service_tokens_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[ServiceToken]**](ServiceToken.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | List of service tokens |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **service_tokens_id_delete**
> service_tokens_id_delete(id)

Delete service token

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
    api_instance = hooksniff.ServiceTokensApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Delete service token
        api_instance.service_tokens_id_delete(id)
    except Exception as e:
        print("Exception when calling ServiceTokensApi->service_tokens_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

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
**200** | Token deleted |  -  |
**404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **service_tokens_id_put**
> service_tokens_id_put(id, service_tokens_id_put_request=service_tokens_id_put_request)

Update service token

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.service_tokens_id_put_request import ServiceTokensIdPutRequest
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
    api_instance = hooksniff.ServiceTokensApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    service_tokens_id_put_request = hooksniff.ServiceTokensIdPutRequest() # ServiceTokensIdPutRequest |  (optional)

    try:
        # Update service token
        api_instance.service_tokens_id_put(id, service_tokens_id_put_request=service_tokens_id_put_request)
    except Exception as e:
        print("Exception when calling ServiceTokensApi->service_tokens_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **service_tokens_id_put_request** | [**ServiceTokensIdPutRequest**](ServiceTokensIdPutRequest.md)|  | [optional] 

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
**200** | Token updated |  -  |
**404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **service_tokens_id_reveal_post**
> ServiceTokensIdRevealPost200Response service_tokens_id_reveal_post(id)

Reveal service token

Returns the full token value (only available once after creation, or via this endpoint)

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.service_tokens_id_reveal_post200_response import ServiceTokensIdRevealPost200Response
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
    api_instance = hooksniff.ServiceTokensApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Reveal service token
        api_response = api_instance.service_tokens_id_reveal_post(id)
        print("The response of ServiceTokensApi->service_tokens_id_reveal_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ServiceTokensApi->service_tokens_id_reveal_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 

### Return type

[**ServiceTokensIdRevealPost200Response**](ServiceTokensIdRevealPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Token revealed |  -  |
**404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **service_tokens_post**
> ServiceTokenCreateResponse service_tokens_post(service_tokens_post_request)

Create a service token

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.service_token_create_response import ServiceTokenCreateResponse
from hooksniff.models.service_tokens_post_request import ServiceTokensPostRequest
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
    api_instance = hooksniff.ServiceTokensApi(api_client)
    service_tokens_post_request = hooksniff.ServiceTokensPostRequest() # ServiceTokensPostRequest | 

    try:
        # Create a service token
        api_response = api_instance.service_tokens_post(service_tokens_post_request)
        print("The response of ServiceTokensApi->service_tokens_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ServiceTokensApi->service_tokens_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **service_tokens_post_request** | [**ServiceTokensPostRequest**](ServiceTokensPostRequest.md)|  | 

### Return type

[**ServiceTokenCreateResponse**](ServiceTokenCreateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Token created (full token shown only once) |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

