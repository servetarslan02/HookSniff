# ExportDataResponse

GDPR data export containing all user data

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**user** | [**CustomerResponse**](CustomerResponse.md) |  | [optional] 
**endpoints** | [**List[Endpoint]**](Endpoint.md) |  | [optional] 
**deliveries** | [**List[Delivery]**](Delivery.md) |  | [optional] 
**teams** | [**List[Team]**](Team.md) |  | [optional] 
**exported_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.export_data_response import ExportDataResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ExportDataResponse from a JSON string
export_data_response_instance = ExportDataResponse.from_json(json)
# print the JSON string representation of the object
print(ExportDataResponse.to_json())

# convert the object into a dict
export_data_response_dict = export_data_response_instance.to_dict()
# create an instance of ExportDataResponse from a dict
export_data_response_from_dict = ExportDataResponse.from_dict(export_data_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


