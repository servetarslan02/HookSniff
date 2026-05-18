# hooksniff.InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**inbound_configs_get**](InboundApi.md#inbound_configs_get) | **GET** /inbound/configs | List inbound webhook configs
[**inbound_configs_id_delete**](InboundApi.md#inbound_configs_id_delete) | **DELETE** /inbound/configs/{id} | Delete inbound config
[**inbound_configs_id_put**](InboundApi.md#inbound_configs_id_put) | **PUT** /inbound/configs/{id} | Update inbound config
[**inbound_configs_post**](InboundApi.md#inbound_configs_post) | **POST** /inbound/configs | Create inbound webhook config
[**inbound_provider_endpoint_id_post**](InboundApi.md#inbound_provider_endpoint_id_post) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint
[**inbound_provider_post**](InboundApi.md#inbound_provider_post) | **POST** /inbound/{provider} | Receive inbound webhook from a provider


# **inbound_configs_get**
> List[InboundConfig] inbound_configs_get()

List inbound webhook configs

Returns all inbound webhook configurations for the authenticated user

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.inbound_config import InboundConfig
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
    api_instance = hooksniff.InboundApi(api_client)

    try:
        # List inbound webhook configs
        api_response = api_instance.inbound_configs_get()
        print("The response of InboundApi->inbound_configs_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling InboundApi->inbound_configs_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[InboundConfig]**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | List of inbound configs |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inbound_configs_id_delete**
> inbound_configs_id_delete(id)

Delete inbound config

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
    api_instance = hooksniff.InboundApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Delete inbound config
        api_instance.inbound_configs_id_delete(id)
    except Exception as e:
        print("Exception when calling InboundApi->inbound_configs_id_delete: %s\n" % e)
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
**200** | Config deleted |  -  |
**404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inbound_configs_id_put**
> InboundConfig inbound_configs_id_put(id, inbound_configs_id_put_request=inbound_configs_id_put_request)

Update inbound config

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.inbound_config import InboundConfig
from hooksniff.models.inbound_configs_id_put_request import InboundConfigsIdPutRequest
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
    api_instance = hooksniff.InboundApi(api_client)
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    inbound_configs_id_put_request = hooksniff.InboundConfigsIdPutRequest() # InboundConfigsIdPutRequest |  (optional)

    try:
        # Update inbound config
        api_response = api_instance.inbound_configs_id_put(id, inbound_configs_id_put_request=inbound_configs_id_put_request)
        print("The response of InboundApi->inbound_configs_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling InboundApi->inbound_configs_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **UUID**|  | 
 **inbound_configs_id_put_request** | [**InboundConfigsIdPutRequest**](InboundConfigsIdPutRequest.md)|  | [optional] 

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Config updated |  -  |
**404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inbound_configs_post**
> InboundConfig inbound_configs_post(inbound_configs_post_request)

Create inbound webhook config

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.inbound_config import InboundConfig
from hooksniff.models.inbound_configs_post_request import InboundConfigsPostRequest
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
    api_instance = hooksniff.InboundApi(api_client)
    inbound_configs_post_request = hooksniff.InboundConfigsPostRequest() # InboundConfigsPostRequest | 

    try:
        # Create inbound webhook config
        api_response = api_instance.inbound_configs_post(inbound_configs_post_request)
        print("The response of InboundApi->inbound_configs_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling InboundApi->inbound_configs_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **inbound_configs_post_request** | [**InboundConfigsPostRequest**](InboundConfigsPostRequest.md)|  | 

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Config created |  -  |
**400** | Validation error |  -  |
**401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inbound_provider_endpoint_id_post**
> inbound_provider_endpoint_id_post(provider, endpoint_id, body)

Receive inbound webhook for a specific endpoint

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
    api_instance = hooksniff.InboundApi(api_client)
    provider = 'provider_example' # str | 
    endpoint_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    body = None # object | 

    try:
        # Receive inbound webhook for a specific endpoint
        api_instance.inbound_provider_endpoint_id_post(provider, endpoint_id, body)
    except Exception as e:
        print("Exception when calling InboundApi->inbound_provider_endpoint_id_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **str**|  | 
 **endpoint_id** | **UUID**|  | 
 **body** | **object**|  | 

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
**200** | Webhook accepted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inbound_provider_post**
> inbound_provider_post(provider, body)

Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.)
and routes them to the customer's endpoints.


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
    api_instance = hooksniff.InboundApi(api_client)
    provider = 'provider_example' # str | 
    body = None # object | 

    try:
        # Receive inbound webhook from a provider
        api_instance.inbound_provider_post(provider, body)
    except Exception as e:
        print("Exception when calling InboundApi->inbound_provider_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **str**|  | 
 **body** | **object**|  | 

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
**200** | Webhook accepted |  -  |
**400** | Invalid payload |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

