# LatencyTrendResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**range** | **str** |  | 
**buckets** | [**List[LatencyTrendResponseBucketsInner]**](LatencyTrendResponseBucketsInner.md) |  | 
**overall_avg_ms** | **float** |  | 

## Example

```python
from hooksniff.models.latency_trend_response import LatencyTrendResponse

# TODO update the JSON string below
json = "{}"
# create an instance of LatencyTrendResponse from a JSON string
latency_trend_response_instance = LatencyTrendResponse.from_json(json)
# print the JSON string representation of the object
print(LatencyTrendResponse.to_json())

# convert the object into a dict
latency_trend_response_dict = latency_trend_response_instance.to_dict()
# create an instance of LatencyTrendResponse from a dict
latency_trend_response_from_dict = LatencyTrendResponse.from_dict(latency_trend_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


