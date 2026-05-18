# DeliveryListResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**deliveries** | [**List[Delivery]**](Delivery.md) |  | 
**total** | **int** |  | 
**page** | **int** |  | 
**per_page** | **int** |  | 

## Example

```python
from hooksniff.models.delivery_list_response import DeliveryListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of DeliveryListResponse from a JSON string
delivery_list_response_instance = DeliveryListResponse.from_json(json)
# print the JSON string representation of the object
print(DeliveryListResponse.to_json())

# convert the object into a dict
delivery_list_response_dict = delivery_list_response_instance.to_dict()
# create an instance of DeliveryListResponse from a dict
delivery_list_response_from_dict = DeliveryListResponse.from_dict(delivery_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


