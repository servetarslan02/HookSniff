# AnalyticsTrendResponse

Delivery trend data over a time period

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[AnalyticsTrendPoint]**](AnalyticsTrendPoint.md) | Array of trend data points | 
**period** | **str** | Time range of the data | 

## Example

```python
from hooksniff.models.analytics_trend_response import AnalyticsTrendResponse

# TODO update the JSON string below
json = "{}"
# create an instance of AnalyticsTrendResponse from a JSON string
analytics_trend_response_instance = AnalyticsTrendResponse.from_json(json)
# print the JSON string representation of the object
print(AnalyticsTrendResponse.to_json())

# convert the object into a dict
analytics_trend_response_dict = analytics_trend_response_instance.to_dict()
# create an instance of AnalyticsTrendResponse from a dict
analytics_trend_response_from_dict = AnalyticsTrendResponse.from_dict(analytics_trend_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


