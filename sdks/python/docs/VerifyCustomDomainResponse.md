# VerifyCustomDomainResponse

Result of domain verification attempt

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**dns_records** | [**List[DomainDnsRecord]**](DomainDnsRecord.md) | DNS records that need to be configured | 

## Example

```python
from hooksniff.models.verify_custom_domain_response import VerifyCustomDomainResponse

# TODO update the JSON string below
json = "{}"
# create an instance of VerifyCustomDomainResponse from a JSON string
verify_custom_domain_response_instance = VerifyCustomDomainResponse.from_json(json)
# print the JSON string representation of the object
print(VerifyCustomDomainResponse.to_json())

# convert the object into a dict
verify_custom_domain_response_dict = verify_custom_domain_response_instance.to_dict()
# create an instance of VerifyCustomDomainResponse from a dict
verify_custom_domain_response_from_dict = VerifyCustomDomainResponse.from_dict(verify_custom_domain_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


