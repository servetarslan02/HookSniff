# AdminSdkUpdatePostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **str** |  | [optional] 
**message** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.admin_sdk_update_post_request import AdminSdkUpdatePostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of AdminSdkUpdatePostRequest from a JSON string
admin_sdk_update_post_request_instance = AdminSdkUpdatePostRequest.from_json(json)
# print the JSON string representation of the object
print(AdminSdkUpdatePostRequest.to_json())

# convert the object into a dict
admin_sdk_update_post_request_dict = admin_sdk_update_post_request_instance.to_dict()
# create an instance of AdminSdkUpdatePostRequest from a dict
admin_sdk_update_post_request_from_dict = AdminSdkUpdatePostRequest.from_dict(admin_sdk_update_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


