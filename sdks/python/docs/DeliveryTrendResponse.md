# DeliveryTrendResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**range** | **str** |  | 
**buckets** | [**List[DeliveryTrendResponseBucketsInner]**](DeliveryTrendResponseBucketsInner.md) |  | 

## Example

```python
from hooksniff.models.delivery_trend_response import DeliveryTrendResponse

# TODO update the JSON string below
json = "{}"
# create an instance of DeliveryTrendResponse from a JSON string
delivery_trend_response_instance = DeliveryTrendResponse.from_json(json)
# print the JSON string representation of the object
print(DeliveryTrendResponse.to_json())

# convert the object into a dict
delivery_trend_response_dict = delivery_trend_response_instance.to_dict()
# create an instance of DeliveryTrendResponse from a dict
delivery_trend_response_from_dict = DeliveryTrendResponse.from_dict(delivery_trend_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


