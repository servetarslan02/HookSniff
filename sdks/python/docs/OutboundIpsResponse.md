# OutboundIPsResponse

List of static outbound IP addresses for firewall whitelisting

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ips** | **List[str]** | IPv4 and IPv6 addresses used for outbound requests | 

## Example

```python
from hooksniff.models.outbound_ips_response import OutboundIPsResponse

# TODO update the JSON string below
json = "{}"
# create an instance of OutboundIPsResponse from a JSON string
outbound_ips_response_instance = OutboundIPsResponse.from_json(json)
# print the JSON string representation of the object
print(OutboundIPsResponse.to_json())

# convert the object into a dict
outbound_ips_response_dict = outbound_ips_response_instance.to_dict()
# create an instance of OutboundIPsResponse from a dict
outbound_ips_response_from_dict = OutboundIPsResponse.from_dict(outbound_ips_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


