# BatchResponseErrorsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**index** | **int** |  | [optional] 
**error** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.batch_response_errors_inner import BatchResponseErrorsInner

# TODO update the JSON string below
json = "{}"
# create an instance of BatchResponseErrorsInner from a JSON string
batch_response_errors_inner_instance = BatchResponseErrorsInner.from_json(json)
# print the JSON string representation of the object
print(BatchResponseErrorsInner.to_json())

# convert the object into a dict
batch_response_errors_inner_dict = batch_response_errors_inner_instance.to_dict()
# create an instance of BatchResponseErrorsInner from a dict
batch_response_errors_inner_from_dict = BatchResponseErrorsInner.from_dict(batch_response_errors_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


