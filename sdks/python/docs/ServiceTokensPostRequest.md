# ServiceTokensPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** | Token name | 

## Example

```python
from hooksniff.models.service_tokens_post_request import ServiceTokensPostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServiceTokensPostRequest from a JSON string
service_tokens_post_request_instance = ServiceTokensPostRequest.from_json(json)
# print the JSON string representation of the object
print(ServiceTokensPostRequest.to_json())

# convert the object into a dict
service_tokens_post_request_dict = service_tokens_post_request_instance.to_dict()
# create an instance of ServiceTokensPostRequest from a dict
service_tokens_post_request_from_dict = ServiceTokensPostRequest.from_dict(service_tokens_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


