# AdminRevenueGet200ResponseInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**month** | **str** |  | [optional] 
**revenue_cents** | **int** |  | [optional] 
**subscriber_count** | **int** |  | [optional] 

## Example

```python
from hooksniff.models.admin_revenue_get200_response_inner import AdminRevenueGet200ResponseInner

# TODO update the JSON string below
json = "{}"
# create an instance of AdminRevenueGet200ResponseInner from a JSON string
admin_revenue_get200_response_inner_instance = AdminRevenueGet200ResponseInner.from_json(json)
# print the JSON string representation of the object
print(AdminRevenueGet200ResponseInner.to_json())

# convert the object into a dict
admin_revenue_get200_response_inner_dict = admin_revenue_get200_response_inner_instance.to_dict()
# create an instance of AdminRevenueGet200ResponseInner from a dict
admin_revenue_get200_response_inner_from_dict = AdminRevenueGet200ResponseInner.from_dict(admin_revenue_get200_response_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


