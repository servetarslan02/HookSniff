# PlatformSettings

Platform-wide configuration settings

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**default_plan** | **str** |  | 
**max_endpoints_free** | **int** |  | 
**max_endpoints_pro** | **int** |  | 
**max_webhooks_free** | **int** |  | 
**max_webhooks_pro** | **int** |  | 
**rate_limit_free** | **int** |  | 
**rate_limit_pro** | **int** |  | 
**retry_max_attempts** | **int** |  | 
**retention_days_free** | **int** |  | 
**retention_days_pro** | **int** |  | 
**maintenance_mode** | **bool** |  | 
**signup_enabled** | **bool** |  | 
**plan_price_pro** | **float** |  | 
**plan_price_business** | **float** |  | 
**resend_api_key** | **str** |  | [optional] 
**email_sender** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.platform_settings import PlatformSettings

# TODO update the JSON string below
json = "{}"
# create an instance of PlatformSettings from a JSON string
platform_settings_instance = PlatformSettings.from_json(json)
# print the JSON string representation of the object
print(PlatformSettings.to_json())

# convert the object into a dict
platform_settings_dict = platform_settings_instance.to_dict()
# create an instance of PlatformSettings from a dict
platform_settings_from_dict = PlatformSettings.from_dict(platform_settings_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


