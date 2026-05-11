# CustomDomainsPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**domain** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.custom_domains_post_request import CustomDomainsPostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CustomDomainsPostRequest from a JSON string
custom_domains_post_request_instance = CustomDomainsPostRequest.from_json(json)
# print the JSON string representation of the object
print(CustomDomainsPostRequest.to_json())

# convert the object into a dict
custom_domains_post_request_dict = custom_domains_post_request_instance.to_dict()
# create an instance of CustomDomainsPostRequest from a dict
custom_domains_post_request_from_dict = CustomDomainsPostRequest.from_dict(custom_domains_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


