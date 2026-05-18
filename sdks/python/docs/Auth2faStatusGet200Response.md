# Auth2faStatusGet200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**enabled** | **bool** |  | [optional] 
**last_used_at** | **datetime** |  | [optional] 

## Example

```python
from hooksniff.models.auth2fa_status_get200_response import Auth2faStatusGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of Auth2faStatusGet200Response from a JSON string
auth2fa_status_get200_response_instance = Auth2faStatusGet200Response.from_json(json)
# print the JSON string representation of the object
print(Auth2faStatusGet200Response.to_json())

# convert the object into a dict
auth2fa_status_get200_response_dict = auth2fa_status_get200_response_instance.to_dict()
# create an instance of Auth2faStatusGet200Response from a dict
auth2fa_status_get200_response_from_dict = Auth2faStatusGet200Response.from_dict(auth2fa_status_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


