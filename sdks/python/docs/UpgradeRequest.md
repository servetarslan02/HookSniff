# UpgradeRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**plan** | **str** |  | 
**provider** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.upgrade_request import UpgradeRequest

# TODO update the JSON string below
json = "{}"
# create an instance of UpgradeRequest from a JSON string
upgrade_request_instance = UpgradeRequest.from_json(json)
# print the JSON string representation of the object
print(UpgradeRequest.to_json())

# convert the object into a dict
upgrade_request_dict = upgrade_request_instance.to_dict()
# create an instance of UpgradeRequest from a dict
upgrade_request_from_dict = UpgradeRequest.from_dict(upgrade_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


