# TeamDetailResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**team** | [**Team**](Team.md) |  | 
**members** | [**List[TeamMember]**](TeamMember.md) |  | 
**invites** | [**List[TeamInvite]**](TeamInvite.md) |  | 

## Example

```python
from hooksniff.models.team_detail_response import TeamDetailResponse

# TODO update the JSON string below
json = "{}"
# create an instance of TeamDetailResponse from a JSON string
team_detail_response_instance = TeamDetailResponse.from_json(json)
# print the JSON string representation of the object
print(TeamDetailResponse.to_json())

# convert the object into a dict
team_detail_response_dict = team_detail_response_instance.to_dict()
# create an instance of TeamDetailResponse from a dict
team_detail_response_from_dict = TeamDetailResponse.from_dict(team_detail_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


