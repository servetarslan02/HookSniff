# ApplicationsIdPutRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | [optional] 
**description** | **str** |  | [optional] 
**is_active** | **bool** |  | [optional] 

## Example

```python
from hooksniff.models.applications_id_put_request import ApplicationsIdPutRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ApplicationsIdPutRequest from a JSON string
applications_id_put_request_instance = ApplicationsIdPutRequest.from_json(json)
# print the JSON string representation of the object
print(ApplicationsIdPutRequest.to_json())

# convert the object into a dict
applications_id_put_request_dict = applications_id_put_request_instance.to_dict()
# create an instance of ApplicationsIdPutRequest from a dict
applications_id_put_request_from_dict = ApplicationsIdPutRequest.from_dict(applications_id_put_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


