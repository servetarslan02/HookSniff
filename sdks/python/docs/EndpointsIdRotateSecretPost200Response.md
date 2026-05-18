# EndpointsIdRotateSecretPost200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**signing_secret** | **str** |  | [optional] 
**message** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.endpoints_id_rotate_secret_post200_response import EndpointsIdRotateSecretPost200Response

# TODO update the JSON string below
json = "{}"
# create an instance of EndpointsIdRotateSecretPost200Response from a JSON string
endpoints_id_rotate_secret_post200_response_instance = EndpointsIdRotateSecretPost200Response.from_json(json)
# print the JSON string representation of the object
print(EndpointsIdRotateSecretPost200Response.to_json())

# convert the object into a dict
endpoints_id_rotate_secret_post200_response_dict = endpoints_id_rotate_secret_post200_response_instance.to_dict()
# create an instance of EndpointsIdRotateSecretPost200Response from a dict
endpoints_id_rotate_secret_post200_response_from_dict = EndpointsIdRotateSecretPost200Response.from_dict(endpoints_id_rotate_secret_post200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


