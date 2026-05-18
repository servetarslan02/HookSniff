# AnalyticsTrendPoint

Single data point in a delivery trend

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**var_date** | **date** | Date of the data point | 
**total** | **int** | Total deliveries on this date | 
**successful** | **int** | Successfully delivered on this date | 
**failed** | **int** | Failed deliveries on this date | 
**avg_latency_ms** | **float** | Average delivery latency in milliseconds | [optional] 

## Example

```python
from hooksniff.models.analytics_trend_point import AnalyticsTrendPoint

# TODO update the JSON string below
json = "{}"
# create an instance of AnalyticsTrendPoint from a JSON string
analytics_trend_point_instance = AnalyticsTrendPoint.from_json(json)
# print the JSON string representation of the object
print(AnalyticsTrendPoint.to_json())

# convert the object into a dict
analytics_trend_point_dict = analytics_trend_point_instance.to_dict()
# create an instance of AnalyticsTrendPoint from a dict
analytics_trend_point_from_dict = AnalyticsTrendPoint.from_dict(analytics_trend_point_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


