# RevenueResponse

Full revenue analytics response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**monthly_revenue** | [**List[RevenueResponseMonthlyRevenueInner]**](RevenueResponseMonthlyRevenueInner.md) |  | 
**revenue_by_plan** | [**List[RevenueResponseRevenueByPlanInner]**](RevenueResponseRevenueByPlanInner.md) |  | 
**mrr** | **float** |  | 
**churn_rate** | **float** |  | 
**mrr_trend** | **float** |  | 

## Example

```python
from hooksniff.models.revenue_response import RevenueResponse

# TODO update the JSON string below
json = "{}"
# create an instance of RevenueResponse from a JSON string
revenue_response_instance = RevenueResponse.from_json(json)
# print the JSON string representation of the object
print(RevenueResponse.to_json())

# convert the object into a dict
revenue_response_dict = revenue_response_instance.to_dict()
# create an instance of RevenueResponse from a dict
revenue_response_from_dict = RevenueResponse.from_dict(revenue_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


