# SystemStats


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total_users** | **int** |  | 
**active_users** | **int** |  | 
**total_endpoints** | **int** |  | 
**total_deliveries** | **int** |  | 
**plan_breakdown** | [**List[SystemStatsPlanBreakdownInner]**](SystemStatsPlanBreakdownInner.md) |  | 

## Example

```python
from hooksniff.models.system_stats import SystemStats

# TODO update the JSON string below
json = "{}"
# create an instance of SystemStats from a JSON string
system_stats_instance = SystemStats.from_json(json)
# print the JSON string representation of the object
print(SystemStats.to_json())

# convert the object into a dict
system_stats_dict = system_stats_instance.to_dict()
# create an instance of SystemStats from a dict
system_stats_from_dict = SystemStats.from_dict(system_stats_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


