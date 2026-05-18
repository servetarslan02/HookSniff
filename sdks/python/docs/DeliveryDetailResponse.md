# DeliveryDetailResponse

Full delivery detail including all retry attempts and endpoint info

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**delivery** | [**Delivery**](Delivery.md) |  | 
**attempts** | [**List[DeliveryAttempt]**](DeliveryAttempt.md) |  | 
**endpoint** | [**Endpoint**](Endpoint.md) |  | [optional] 
**request_headers** | **object** | Original request headers sent with the delivery | [optional] 
**request_body** | **object** | Original request body sent with the delivery | [optional] 
**response_headers** | **object** | Response headers received from the endpoint | [optional] 

## Example

```python
from hooksniff.models.delivery_detail_response import DeliveryDetailResponse

# TODO update the JSON string below
json = "{}"
# create an instance of DeliveryDetailResponse from a JSON string
delivery_detail_response_instance = DeliveryDetailResponse.from_json(json)
# print the JSON string representation of the object
print(DeliveryDetailResponse.to_json())

# convert the object into a dict
delivery_detail_response_dict = delivery_detail_response_instance.to_dict()
# create an instance of DeliveryDetailResponse from a dict
delivery_detail_response_from_dict = DeliveryDetailResponse.from_dict(delivery_detail_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


