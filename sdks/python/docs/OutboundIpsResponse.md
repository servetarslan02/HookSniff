# OutboundIpsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ips** | **List[str]** |  | 
**updated_at** | **str** |  | 

## Example

```python
from hooksniff.models.outbound_ips_response import OutboundIpsResponse

# TODO update the JSON string below
json = "{}"
# create an instance of OutboundIpsResponse from a JSON string
outbound_ips_response_instance = OutboundIpsResponse.from_json(json)
# print the JSON string representation of the object
print(OutboundIpsResponse.to_json())

# convert the object into a dict
outbound_ips_response_dict = outbound_ips_response_instance.to_dict()
# create an instance of OutboundIpsResponse from a dict
outbound_ips_response_from_dict = OutboundIpsResponse.from_dict(outbound_ips_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


