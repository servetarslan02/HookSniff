# CustomerResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**email** | **str** |  | 
**name** | **str** |  | [optional] 
**api_key** | **str** | Only returned on registration | [optional] 
**plan** | **str** |  | 
**webhook_limit** | **int** |  | 
**webhook_count** | **int** |  | 
**is_admin** | **bool** |  | 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.customer_response import CustomerResponse

# TODO update the JSON string below
json = "{}"
# create an instance of CustomerResponse from a JSON string
customer_response_instance = CustomerResponse.from_json(json)
# print the JSON string representation of the object
print(CustomerResponse.to_json())

# convert the object into a dict
customer_response_dict = customer_response_instance.to_dict()
# create an instance of CustomerResponse from a dict
customer_response_from_dict = CustomerResponse.from_dict(customer_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


