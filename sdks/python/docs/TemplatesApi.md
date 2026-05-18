# hooksniff.TemplatesApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**templates_get**](TemplatesApi.md#templates_get) | **GET** /templates | List available templates
[**templates_id_apply_post**](TemplatesApi.md#templates_id_apply_post) | **POST** /templates/{id}/apply | Apply template to an endpoint
[**templates_id_get**](TemplatesApi.md#templates_id_get) | **GET** /templates/{id} | Get template by ID


# **templates_get**
> List[WebhookTemplate] templates_get(category=category)

List available templates

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.webhook_template import WebhookTemplate
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
    api_instance = hooksniff.TemplatesApi(api_client)
    category = 'category_example' # str |  (optional)

    try:
        # List available templates
        api_response = api_instance.templates_get(category=category)
        print("The response of TemplatesApi->templates_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **category** | **str**|  | [optional] 

### Return type

[**List[WebhookTemplate]**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_id_apply_post**
> ApplyTemplateResponse templates_id_apply_post(id, apply_template_request)

Apply template to an endpoint

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.apply_template_request import ApplyTemplateRequest
from hooksniff.models.apply_template_response import ApplyTemplateResponse
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
    api_instance = hooksniff.TemplatesApi(api_client)
    id = 'id_example' # str | 
    apply_template_request = hooksniff.ApplyTemplateRequest() # ApplyTemplateRequest | 

    try:
        # Apply template to an endpoint
        api_response = api_instance.templates_id_apply_post(id, apply_template_request)
        print("The response of TemplatesApi->templates_id_apply_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_id_apply_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **apply_template_request** | [**ApplyTemplateRequest**](ApplyTemplateRequest.md)|  | 

### Return type

[**ApplyTemplateResponse**](ApplyTemplateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template applied |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templates_id_get**
> WebhookTemplate templates_id_get(id)

Get template by ID

### Example

* Bearer Authentication (BearerAuth):

```python
import hooksniff
from hooksniff.models.webhook_template import WebhookTemplate
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
    api_instance = hooksniff.TemplatesApi(api_client)
    id = 'id_example' # str | 

    try:
        # Get template by ID
        api_response = api_instance.templates_id_get(id)
        print("The response of TemplatesApi->templates_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling TemplatesApi->templates_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

[**WebhookTemplate**](WebhookTemplate.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Template details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

