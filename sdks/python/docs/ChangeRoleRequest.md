# ChangeRoleRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**role** | **str** |  | 

## Example

```python
from hooksniff.models.change_role_request import ChangeRoleRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ChangeRoleRequest from a JSON string
change_role_request_instance = ChangeRoleRequest.from_json(json)
# print the JSON string representation of the object
print(ChangeRoleRequest.to_json())

# convert the object into a dict
change_role_request_dict = change_role_request_instance.to_dict()
# create an instance of ChangeRoleRequest from a dict
change_role_request_from_dict = ChangeRoleRequest.from_dict(change_role_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


