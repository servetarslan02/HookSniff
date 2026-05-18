# UsageStatsResponse

Account usage statistics summary

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoints_count** | **int** | Number of active endpoints | 
**deliveries_count** | **int** | Total deliveries in current period | 
**teams_count** | **int** | Number of teams | 
**storage_used_bytes** | **int** | Storage used in bytes | 

## Example

```python
from hooksniff.models.usage_stats_response import UsageStatsResponse

# TODO update the JSON string below
json = "{}"
# create an instance of UsageStatsResponse from a JSON string
usage_stats_response_instance = UsageStatsResponse.from_json(json)
# print the JSON string representation of the object
print(UsageStatsResponse.to_json())

# convert the object into a dict
usage_stats_response_dict = usage_stats_response_instance.to_dict()
# create an instance of UsageStatsResponse from a dict
usage_stats_response_from_dict = UsageStatsResponse.from_dict(usage_stats_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


