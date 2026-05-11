# TeamMemberListResponse

List of members in a team

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[TeamMember]**](TeamMember.md) |  | 

## Example

```python
from hooksniff.models.team_member_list_response import TeamMemberListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of TeamMemberListResponse from a JSON string
team_member_list_response_instance = TeamMemberListResponse.from_json(json)
# print the JSON string representation of the object
print(TeamMemberListResponse.to_json())

# convert the object into a dict
team_member_list_response_dict = team_member_list_response_instance.to_dict()
# create an instance of TeamMemberListResponse from a dict
team_member_list_response_from_dict = TeamMemberListResponse.from_dict(team_member_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


