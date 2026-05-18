# DomainDnsRecord

A DNS record required for domain verification

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **str** |  | 
**name** | **str** | DNS record name/host | 
**value** | **str** | DNS record value | 
**status** | **str** |  | 

## Example

```python
from hooksniff.models.domain_dns_record import DomainDnsRecord

# TODO update the JSON string below
json = "{}"
# create an instance of DomainDnsRecord from a JSON string
domain_dns_record_instance = DomainDnsRecord.from_json(json)
# print the JSON string representation of the object
print(DomainDnsRecord.to_json())

# convert the object into a dict
domain_dns_record_dict = domain_dns_record_instance.to_dict()
# create an instance of DomainDnsRecord from a dict
domain_dns_record_from_dict = DomainDnsRecord.from_dict(domain_dns_record_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


