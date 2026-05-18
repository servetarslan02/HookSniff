# ServiceTokensIdRevealPost200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token** | **str** | Full token value (null if not available) | [optional] 
**message** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.service_tokens_id_reveal_post200_response import ServiceTokensIdRevealPost200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ServiceTokensIdRevealPost200Response from a JSON string
service_tokens_id_reveal_post200_response_instance = ServiceTokensIdRevealPost200Response.from_json(json)
# print the JSON string representation of the object
print(ServiceTokensIdRevealPost200Response.to_json())

# convert the object into a dict
service_tokens_id_reveal_post200_response_dict = service_tokens_id_reveal_post200_response_instance.to_dict()
# create an instance of ServiceTokensIdRevealPost200Response from a dict
service_tokens_id_reveal_post200_response_from_dict = ServiceTokensIdRevealPost200Response.from_dict(service_tokens_id_reveal_post200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


