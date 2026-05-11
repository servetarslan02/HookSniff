# TeamInvite


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**email** | **str** |  | 
**role** | **str** |  | 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.team_invite import TeamInvite

# TODO update the JSON string below
json = "{}"
# create an instance of TeamInvite from a JSON string
team_invite_instance = TeamInvite.from_json(json)
# print the JSON string representation of the object
print(TeamInvite.to_json())

# convert the object into a dict
team_invite_dict = team_invite_instance.to_dict()
# create an instance of TeamInvite from a dict
team_invite_from_dict = TeamInvite.from_dict(team_invite_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


