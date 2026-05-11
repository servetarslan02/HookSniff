# RateLimitUsage

Current rate limit usage for an endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**current_rps** | **float** | Current requests per second being consumed | 
**limit_rps** | **float** | Configured requests per second limit | 
**remaining** | **float** | Remaining capacity | 
**reset_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.rate_limit_usage import RateLimitUsage

# TODO update the JSON string below
json = "{}"
# create an instance of RateLimitUsage from a JSON string
rate_limit_usage_instance = RateLimitUsage.from_json(json)
# print the JSON string representation of the object
print(RateLimitUsage.to_json())

# convert the object into a dict
rate_limit_usage_dict = rate_limit_usage_instance.to_dict()
# create an instance of RateLimitUsage from a dict
rate_limit_usage_from_dict = RateLimitUsage.from_dict(rate_limit_usage_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


