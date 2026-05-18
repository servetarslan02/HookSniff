# ApplicationsPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**description** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.applications_post_request import ApplicationsPostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ApplicationsPostRequest from a JSON string
applications_post_request_instance = ApplicationsPostRequest.from_json(json)
# print the JSON string representation of the object
print(ApplicationsPostRequest.to_json())

# convert the object into a dict
applications_post_request_dict = applications_post_request_instance.to_dict()
# create an instance of ApplicationsPostRequest from a dict
applications_post_request_from_dict = ApplicationsPostRequest.from_dict(applications_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


