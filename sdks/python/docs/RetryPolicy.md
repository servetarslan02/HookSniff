# RetryPolicy


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**max_attempts** | **int** |  | [default to 3]
**backoff** | **str** |  | [default to 'exponential']
**initial_delay_secs** | **int** |  | [default to 10]
**max_delay_secs** | **int** |  | [default to 3600]

## Example

```python
from hooksniff.models.retry_policy import RetryPolicy

# TODO update the JSON string below
json = "{}"
# create an instance of RetryPolicy from a JSON string
retry_policy_instance = RetryPolicy.from_json(json)
# print the JSON string representation of the object
print(RetryPolicy.to_json())

# convert the object into a dict
retry_policy_dict = retry_policy_instance.to_dict()
# create an instance of RetryPolicy from a dict
retry_policy_from_dict = RetryPolicy.from_dict(retry_policy_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


