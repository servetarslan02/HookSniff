# InvoiceResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | 
**amount_cents** | **int** |  | 
**currency** | **str** |  | 
**status** | **str** |  | 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.invoice_response import InvoiceResponse

# TODO update the JSON string below
json = "{}"
# create an instance of InvoiceResponse from a JSON string
invoice_response_instance = InvoiceResponse.from_json(json)
# print the JSON string representation of the object
print(InvoiceResponse.to_json())

# convert the object into a dict
invoice_response_dict = invoice_response_instance.to_dict()
# create an instance of InvoiceResponse from a dict
invoice_response_from_dict = InvoiceResponse.from_dict(invoice_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


