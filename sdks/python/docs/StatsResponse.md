# StatsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total_deliveries** | **int** |  | 
**successful_deliveries** | **int** |  | 
**failed_deliveries** | **int** |  | 
**total_endpoints** | **int** |  | 
**active_endpoints** | **int** |  | 
**plan** | **str** |  | 
**webhook_limit** | **int** |  | 
**webhook_count** | **int** |  | 

## Example

```python
from hooksniff.models.stats_response import StatsResponse

# TODO update the JSON string below
json = "{}"
# create an instance of StatsResponse from a JSON string
stats_response_instance = StatsResponse.from_json(json)
# print the JSON string representation of the object
print(StatsResponse.to_json())

# convert the object into a dict
stats_response_dict = stats_response_instance.to_dict()
# create an instance of StatsResponse from a dict
stats_response_from_dict = StatsResponse.from_dict(stats_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


