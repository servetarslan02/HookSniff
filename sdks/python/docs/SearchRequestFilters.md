# SearchRequestFilters

Additional filters (status, endpoint_id, etc.)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | [optional] 
**endpoint_id** | **UUID** |  | [optional] 

## Example

```python
from hooksniff.models.search_request_filters import SearchRequestFilters

# TODO update the JSON string below
json = "{}"
# create an instance of SearchRequestFilters from a JSON string
search_request_filters_instance = SearchRequestFilters.from_json(json)
# print the JSON string representation of the object
print(SearchRequestFilters.to_json())

# convert the object into a dict
search_request_filters_dict = search_request_filters_instance.to_dict()
# create an instance of SearchRequestFilters from a dict
search_request_filters_from_dict = SearchRequestFilters.from_dict(search_request_filters_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


