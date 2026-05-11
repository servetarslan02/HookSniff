# UpgradeResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**checkout_url** | **str** |  | [optional] 
**provider** | **str** |  | 
**message** | **str** |  | 

## Example

```python
from hooksniff.models.upgrade_response import UpgradeResponse

# TODO update the JSON string below
json = "{}"
# create an instance of UpgradeResponse from a JSON string
upgrade_response_instance = UpgradeResponse.from_json(json)
# print the JSON string representation of the object
print(UpgradeResponse.to_json())

# convert the object into a dict
upgrade_response_dict = upgrade_response_instance.to_dict()
# create an instance of UpgradeResponse from a dict
upgrade_response_from_dict = UpgradeResponse.from_dict(upgrade_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


