# hooksniff.TransformsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpoints_endpoint_id_transforms_get**](TransformsApi.md#endpoints_endpoint_id_transforms_get) | **GET** /endpoints/{endpoint_id}/transforms | List transform rules for endpoint
[**endpoints_endpoint_id_transforms_id_delete**](TransformsApi.md#endpoints_endpoint_id_transforms_id_delete) | **DELETE** /endpoints/{endpoint_id}/transforms/{id} | Delete transform rule
[**endpoints_endpoint_id_transforms_id_put**](TransformsApi.md#endpoints_endpoint_id_transforms_id_put) | **PUT** /endpoints/{endpoint_id}/transforms/{id} | Update transform rule
[**endpoints_endpoint_id_transforms_post**](TransformsApi.md#endpoints_endpoint_id_transforms_post) | **POST** /endpoints/{endpoint_id}/transforms | Create transform rule
[**endpoints_endpoint_id_transforms_test_post**](TransformsApi.md#endpoints_endpoint_id_transforms_test_post) | **POST** /endpoints/{endpoint_id}/transforms/test | Test a transform rule


# **endpoints_endpoint_id_transforms_get**
> List[TransformRule] endpoints_endpoint_id_transforms_get(endpoint_id)

List transform rules for endpoint

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.transform_rule import TransformRule
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
    api_instance = hooksniff.TransformsApi(api_client)
    endpoint_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # List transform rules for endpoint
        api_response = api_instance.endpoints_endpoint_id_transforms_get(endpoint_id)
        print("The response of TransformsApi->endpoints_endpoint_id_transforms_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TransformsApi->endpoints_endpoint_id_transforms_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **UUID**|  | 

### Return type

[**List[TransformRule]**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Transform rule list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpoints_endpoint_id_transforms_id_delete**
> endpoints_endpoint_id_transforms_id_delete(endpoint_id, id)

Delete transform rule

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
    api_instance = hooksniff.TransformsApi(api_client)
    endpoint_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 

    try:
        # Delete transform rule
        api_instance.endpoints_endpoint_id_transforms_id_delete(endpoint_id, id)
    except Exception as e:
        print("Exception when calling TransformsApi->endpoints_endpoint_id_transforms_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **UUID**|  | 
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
**200** | Rule deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpoints_endpoint_id_transforms_id_put**
> TransformRule endpoints_endpoint_id_transforms_id_put(endpoint_id, id, body)

Update transform rule

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.transform_rule import TransformRule
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
    api_instance = hooksniff.TransformsApi(api_client)
    endpoint_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    body = None # object | 

    try:
        # Update transform rule
        api_response = api_instance.endpoints_endpoint_id_transforms_id_put(endpoint_id, id, body)
        print("The response of TransformsApi->endpoints_endpoint_id_transforms_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TransformsApi->endpoints_endpoint_id_transforms_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **UUID**|  | 
 **id** | **UUID**|  | 
 **body** | **object**|  | 

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Rule updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpoints_endpoint_id_transforms_post**
> TransformRule endpoints_endpoint_id_transforms_post(endpoint_id, create_transform_rule_request)

Create transform rule

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.create_transform_rule_request import CreateTransformRuleRequest
from hooksniff.models.transform_rule import TransformRule
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
    api_instance = hooksniff.TransformsApi(api_client)
    endpoint_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    create_transform_rule_request = hooksniff.CreateTransformRuleRequest() # CreateTransformRuleRequest | 

    try:
        # Create transform rule
        api_response = api_instance.endpoints_endpoint_id_transforms_post(endpoint_id, create_transform_rule_request)
        print("The response of TransformsApi->endpoints_endpoint_id_transforms_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TransformsApi->endpoints_endpoint_id_transforms_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **UUID**|  | 
 **create_transform_rule_request** | [**CreateTransformRuleRequest**](CreateTransformRuleRequest.md)|  | 

### Return type

[**TransformRule**](TransformRule.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Rule created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **endpoints_endpoint_id_transforms_test_post**
> endpoints_endpoint_id_transforms_test_post(endpoint_id, endpoints_endpoint_id_transforms_test_post_request)

Test a transform rule

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.endpoints_endpoint_id_transforms_test_post_request import EndpointsEndpointIdTransformsTestPostRequest
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
    api_instance = hooksniff.TransformsApi(api_client)
    endpoint_id = UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d') # UUID | 
    endpoints_endpoint_id_transforms_test_post_request = hooksniff.EndpointsEndpointIdTransformsTestPostRequest() # EndpointsEndpointIdTransformsTestPostRequest | 

    try:
        # Test a transform rule
        api_instance.endpoints_endpoint_id_transforms_test_post(endpoint_id, endpoints_endpoint_id_transforms_test_post_request)
    except Exception as e:
        print("Exception when calling TransformsApi->endpoints_endpoint_id_transforms_test_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **endpoint_id** | **UUID**|  | 
 **endpoints_endpoint_id_transforms_test_post_request** | [**EndpointsEndpointIdTransformsTestPostRequest**](EndpointsEndpointIdTransformsTestPostRequest.md)|  | 

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
**200** | Transformed output |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

