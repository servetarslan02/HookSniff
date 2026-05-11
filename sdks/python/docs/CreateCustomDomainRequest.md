# CreateCustomDomainRequest

Register a new custom domain

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**domain** | **str** | Fully qualified domain name to register | 

## Example

```python
from hooksniff.models.create_custom_domain_request import CreateCustomDomainRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CreateCustomDomainRequest from a JSON string
create_custom_domain_request_instance = CreateCustomDomainRequest.from_json(json)
# print the JSON string representation of the object
print(CreateCustomDomainRequest.to_json())

# convert the object into a dict
create_custom_domain_request_dict = create_custom_domain_request_instance.to_dict()
# create an instance of CreateCustomDomainRequest from a dict
create_custom_domain_request_from_dict = CreateCustomDomainRequest.from_dict(create_custom_domain_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


