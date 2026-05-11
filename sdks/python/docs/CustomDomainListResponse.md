# CustomDomainListResponse

List of custom domains

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[CustomDomain]**](CustomDomain.md) |  | 

## Example

```python
from hooksniff.models.custom_domain_list_response import CustomDomainListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of CustomDomainListResponse from a JSON string
custom_domain_list_response_instance = CustomDomainListResponse.from_json(json)
# print the JSON string representation of the object
print(CustomDomainListResponse.to_json())

# convert the object into a dict
custom_domain_list_response_dict = custom_domain_list_response_instance.to_dict()
# create an instance of CustomDomainListResponse from a dict
custom_domain_list_response_from_dict = CustomDomainListResponse.from_dict(custom_domain_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


