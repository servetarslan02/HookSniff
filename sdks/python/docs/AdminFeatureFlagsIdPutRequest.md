# AdminFeatureFlagsIdPutRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | [optional] 
**description** | **str** |  | [optional] 
**is_enabled** | **bool** |  | [optional] 
**rollout_percentage** | **int** |  | [optional] 
**enabled_for_plans** | **List[str]** |  | [optional] 

## Example

```python
from hooksniff.models.admin_feature_flags_id_put_request import AdminFeatureFlagsIdPutRequest

# TODO update the JSON string below
json = "{}"
# create an instance of AdminFeatureFlagsIdPutRequest from a JSON string
admin_feature_flags_id_put_request_instance = AdminFeatureFlagsIdPutRequest.from_json(json)
# print the JSON string representation of the object
print(AdminFeatureFlagsIdPutRequest.to_json())

# convert the object into a dict
admin_feature_flags_id_put_request_dict = admin_feature_flags_id_put_request_instance.to_dict()
# create an instance of AdminFeatureFlagsIdPutRequest from a dict
admin_feature_flags_id_put_request_from_dict = AdminFeatureFlagsIdPutRequest.from_dict(admin_feature_flags_id_put_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


