# StreamParams


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **UUID** |  | 
**status** | **str** |  | 
**limit** | **int** |  | [default to 50]

## Example

```python
from hooksniff.models.stream_params import StreamParams

# TODO update the JSON string below
json = "{}"
# create an instance of StreamParams from a JSON string
stream_params_instance = StreamParams.from_json(json)
# print the JSON string representation of the object
print(StreamParams.to_json())

# convert the object into a dict
stream_params_dict = stream_params_instance.to_dict()
# create an instance of StreamParams from a dict
stream_params_from_dict = StreamParams.from_dict(stream_params_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


