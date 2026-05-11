# AdminRevenueEntry

Monthly revenue data point

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**var_date** | **date** |  | 
**mrr** | **float** | Monthly recurring revenue in dollars | 
**new_subscriptions** | **int** |  | 
**churns** | **int** |  | 

## Example

```python
from hooksniff.models.admin_revenue_entry import AdminRevenueEntry

# TODO update the JSON string below
json = "{}"
# create an instance of AdminRevenueEntry from a JSON string
admin_revenue_entry_instance = AdminRevenueEntry.from_json(json)
# print the JSON string representation of the object
print(AdminRevenueEntry.to_json())

# convert the object into a dict
admin_revenue_entry_dict = admin_revenue_entry_instance.to_dict()
# create an instance of AdminRevenueEntry from a dict
admin_revenue_entry_from_dict = AdminRevenueEntry.from_dict(admin_revenue_entry_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


