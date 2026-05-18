# WebhookFilter

Query parameters for filtering webhook deliveries

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** | Filter by delivery status | 
**endpoint_id** | **UUID** |  | 
**event_type** | **str** | Filter by event type (e.g. order.created) | 
**from_date** | **datetime** |  | 
**to_date** | **datetime** |  | 
**page** | **int** |  | [default to 1]
**per_page** | **int** |  | [default to 20]

## Example

```python
from hooksniff.models.webhook_filter import WebhookFilter

# TODO update the JSON string below
json = "{}"
# create an instance of WebhookFilter from a JSON string
webhook_filter_instance = WebhookFilter.from_json(json)
# print the JSON string representation of the object
print(WebhookFilter.to_json())

# convert the object into a dict
webhook_filter_dict = webhook_filter_instance.to_dict()
# create an instance of WebhookFilter from a dict
webhook_filter_from_dict = WebhookFilter.from_dict(webhook_filter_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


