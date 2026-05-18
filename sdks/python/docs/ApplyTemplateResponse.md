# ApplyTemplateResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**success** | **bool** |  | 
**message** | **str** |  | 

## Example

```python
from hooksniff.models.apply_template_response import ApplyTemplateResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ApplyTemplateResponse from a JSON string
apply_template_response_instance = ApplyTemplateResponse.from_json(json)
# print the JSON string representation of the object
print(ApplyTemplateResponse.to_json())

# convert the object into a dict
apply_template_response_dict = apply_template_response_instance.to_dict()
# create an instance of ApplyTemplateResponse from a dict
apply_template_response_from_dict = ApplyTemplateResponse.from_dict(apply_template_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


