# DeliveryTrendResponseBucketsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**timestamp** | **str** |  | [optional] 
**successful** | **int** |  | [optional] 
**failed** | **int** |  | [optional] 
**total** | **int** |  | [optional] 

## Example

```python
from hooksniff.models.delivery_trend_response_buckets_inner import DeliveryTrendResponseBucketsInner

# TODO update the JSON string below
json = "{}"
# create an instance of DeliveryTrendResponseBucketsInner from a JSON string
delivery_trend_response_buckets_inner_instance = DeliveryTrendResponseBucketsInner.from_json(json)
# print the JSON string representation of the object
print(DeliveryTrendResponseBucketsInner.to_json())

# convert the object into a dict
delivery_trend_response_buckets_inner_dict = delivery_trend_response_buckets_inner_instance.to_dict()
# create an instance of DeliveryTrendResponseBucketsInner from a dict
delivery_trend_response_buckets_inner_from_dict = DeliveryTrendResponseBucketsInner.from_dict(delivery_trend_response_buckets_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


