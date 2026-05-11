# LatencyTrendResponseBucketsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**timestamp** | **str** |  | [optional] 
**avg_ms** | **float** |  | [optional] 
**p95_ms** | **float** |  | [optional] 

## Example

```python
from hooksniff.models.latency_trend_response_buckets_inner import LatencyTrendResponseBucketsInner

# TODO update the JSON string below
json = "{}"
# create an instance of LatencyTrendResponseBucketsInner from a JSON string
latency_trend_response_buckets_inner_instance = LatencyTrendResponseBucketsInner.from_json(json)
# print the JSON string representation of the object
print(LatencyTrendResponseBucketsInner.to_json())

# convert the object into a dict
latency_trend_response_buckets_inner_dict = latency_trend_response_buckets_inner_instance.to_dict()
# create an instance of LatencyTrendResponseBucketsInner from a dict
latency_trend_response_buckets_inner_from_dict = LatencyTrendResponseBucketsInner.from_dict(latency_trend_response_buckets_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


