# AdminRevenueResponse

Revenue history for admin analytics

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[AdminRevenueEntry]**](AdminRevenueEntry.md) |  | 
**total_mrr** | **float** | Current total MRR across all subscriptions | 

## Example

```python
from hooksniff.models.admin_revenue_response import AdminRevenueResponse

# TODO update the JSON string below
json = "{}"
# create an instance of AdminRevenueResponse from a JSON string
admin_revenue_response_instance = AdminRevenueResponse.from_json(json)
# print the JSON string representation of the object
print(AdminRevenueResponse.to_json())

# convert the object into a dict
admin_revenue_response_dict = admin_revenue_response_instance.to_dict()
# create an instance of AdminRevenueResponse from a dict
admin_revenue_response_from_dict = AdminRevenueResponse.from_dict(admin_revenue_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


