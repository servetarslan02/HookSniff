# DeployInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **str** | Semantic version from Cargo.toml | [optional] 
**git_commit** | **str** | Git SHA of the deployed commit | [optional] 
**build_time** | **str** | ISO 8601 build timestamp | [optional] 
**environment** | **str** | Deployment environment (production, staging, etc.) | [optional] 

## Example

```python
from hooksniff.models.deploy_info import DeployInfo

# TODO update the JSON string below
json = "{}"
# create an instance of DeployInfo from a JSON string
deploy_info_instance = DeployInfo.from_json(json)
# print the JSON string representation of the object
print(DeployInfo.to_json())

# convert the object into a dict
deploy_info_dict = deploy_info_instance.to_dict()
# create an instance of DeployInfo from a dict
deploy_info_from_dict = DeployInfo.from_dict(deploy_info_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


