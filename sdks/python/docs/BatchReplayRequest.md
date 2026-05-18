# BatchReplayRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ids** | **List[UUID]** |  | 

## Example

```python
from hooksniff.models.batch_replay_request import BatchReplayRequest

# TODO update the JSON string below
json = "{}"
# create an instance of BatchReplayRequest from a JSON string
batch_replay_request_instance = BatchReplayRequest.from_json(json)
# print the JSON string representation of the object
print(BatchReplayRequest.to_json())

# convert the object into a dict
batch_replay_request_dict = batch_replay_request_instance.to_dict()
# create an instance of BatchReplayRequest from a dict
batch_replay_request_from_dict = BatchReplayRequest.from_dict(batch_replay_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


