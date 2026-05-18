# AdminFeatureFlagsPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**description** | **str** |  | [optional] 
**is_enabled** | **bool** |  | [optional] [default to False]
**rollout_percentage** | **int** |  | [optional] [default to 100]
**enabled_for_plans** | **List[str]** |  | [optional] 

## Example

```python
from hooksniff.models.admin_feature_flags_post_request import AdminFeatureFlagsPostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of AdminFeatureFlagsPostRequest from a JSON string
admin_feature_flags_post_request_instance = AdminFeatureFlagsPostRequest.from_json(json)
# print the JSON string representation of the object
print(AdminFeatureFlagsPostRequest.to_json())

# convert the object into a dict
admin_feature_flags_post_request_dict = admin_feature_flags_post_request_instance.to_dict()
# create an instance of AdminFeatureFlagsPostRequest from a dict
admin_feature_flags_post_request_from_dict = AdminFeatureFlagsPostRequest.from_dict(admin_feature_flags_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


