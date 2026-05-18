# AdminFeatureFlagsGet200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**flags** | [**List[FeatureFlag]**](FeatureFlag.md) |  | [optional] 

## Example

```python
from hooksniff.models.admin_feature_flags_get200_response import AdminFeatureFlagsGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of AdminFeatureFlagsGet200Response from a JSON string
admin_feature_flags_get200_response_instance = AdminFeatureFlagsGet200Response.from_json(json)
# print the JSON string representation of the object
print(AdminFeatureFlagsGet200Response.to_json())

# convert the object into a dict
admin_feature_flags_get200_response_dict = admin_feature_flags_get200_response_instance.to_dict()
# create an instance of AdminFeatureFlagsGet200Response from a dict
admin_feature_flags_get200_response_from_dict = AdminFeatureFlagsGet200Response.from_dict(admin_feature_flags_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


