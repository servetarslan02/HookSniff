# AdminUserListResponse

Paginated list of users for admin management

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[UserSummary]**](UserSummary.md) |  | 
**has_more** | **bool** |  | 
**total** | **int** |  | 

## Example

```python
from hooksniff.models.admin_user_list_response import AdminUserListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of AdminUserListResponse from a JSON string
admin_user_list_response_instance = AdminUserListResponse.from_json(json)
# print the JSON string representation of the object
print(AdminUserListResponse.to_json())

# convert the object into a dict
admin_user_list_response_dict = admin_user_list_response_instance.to_dict()
# create an instance of AdminUserListResponse from a dict
admin_user_list_response_from_dict = AdminUserListResponse.from_dict(admin_user_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


