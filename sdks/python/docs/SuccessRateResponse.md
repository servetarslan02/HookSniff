# SuccessRateResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**range** | **str** |  | 
**successful** | **int** |  | 
**failed** | **int** |  | 
**pending** | **int** |  | 
**success_rate** | **float** |  | 

## Example

```python
from hooksniff.models.success_rate_response import SuccessRateResponse

# TODO update the JSON string below
json = "{}"
# create an instance of SuccessRateResponse from a JSON string
success_rate_response_instance = SuccessRateResponse.from_json(json)
# print the JSON string representation of the object
print(SuccessRateResponse.to_json())

# convert the object into a dict
success_rate_response_dict = success_rate_response_instance.to_dict()
# create an instance of SuccessRateResponse from a dict
success_rate_response_from_dict = SuccessRateResponse.from_dict(success_rate_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


