# InvoiceListResponse

Paginated list of invoices

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[InvoiceResponse]**](InvoiceResponse.md) |  | 
**has_more** | **bool** |  | 
**total** | **int** |  | 

## Example

```python
from hooksniff.models.invoice_list_response import InvoiceListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of InvoiceListResponse from a JSON string
invoice_list_response_instance = InvoiceListResponse.from_json(json)
# print the JSON string representation of the object
print(InvoiceListResponse.to_json())

# convert the object into a dict
invoice_list_response_dict = invoice_list_response_instance.to_dict()
# create an instance of InvoiceListResponse from a dict
invoice_list_response_from_dict = InvoiceListResponse.from_dict(invoice_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


