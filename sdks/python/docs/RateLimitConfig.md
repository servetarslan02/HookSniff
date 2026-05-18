# RateLimitConfig

Rate limiting configuration for an endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**requests_per_second** | **int** | Maximum requests per second allowed | 
**burst_size** | **int** | Maximum burst above steady-state rate | 
**enabled** | **bool** |  | 

## Example

```python
from hooksniff.models.rate_limit_config import RateLimitConfig

# TODO update the JSON string below
json = "{}"
# create an instance of RateLimitConfig from a JSON string
rate_limit_config_instance = RateLimitConfig.from_json(json)
# print the JSON string representation of the object
print(RateLimitConfig.to_json())

# convert the object into a dict
rate_limit_config_dict = rate_limit_config_instance.to_dict()
# create an instance of RateLimitConfig from a dict
rate_limit_config_from_dict = RateLimitConfig.from_dict(rate_limit_config_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


