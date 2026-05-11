# UpdateNotificationPreferences

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EmailOnFailure** | **bool** |  | 
**EmailOnDeadLetter** | **bool** |  | 
**EmailOnSuccess** | **bool** |  | 
**SlackWebhookUrl** | Pointer to **NullableString** |  | [optional] 
**DiscordWebhookUrl** | Pointer to **NullableString** |  | [optional] 
**WebhookUrl** | Pointer to **NullableString** |  | [optional] 

## Methods

### NewUpdateNotificationPreferences

`func NewUpdateNotificationPreferences(emailOnFailure bool, emailOnDeadLetter bool, emailOnSuccess bool, ) *UpdateNotificationPreferences`

NewUpdateNotificationPreferences instantiates a new UpdateNotificationPreferences object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpdateNotificationPreferencesWithDefaults

`func NewUpdateNotificationPreferencesWithDefaults() *UpdateNotificationPreferences`

NewUpdateNotificationPreferencesWithDefaults instantiates a new UpdateNotificationPreferences object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEmailOnFailure

`func (o *UpdateNotificationPreferences) GetEmailOnFailure() bool`

GetEmailOnFailure returns the EmailOnFailure field if non-nil, zero value otherwise.

### GetEmailOnFailureOk

`func (o *UpdateNotificationPreferences) GetEmailOnFailureOk() (*bool, bool)`

GetEmailOnFailureOk returns a tuple with the EmailOnFailure field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmailOnFailure

`func (o *UpdateNotificationPreferences) SetEmailOnFailure(v bool)`

SetEmailOnFailure sets EmailOnFailure field to given value.


### GetEmailOnDeadLetter

`func (o *UpdateNotificationPreferences) GetEmailOnDeadLetter() bool`

GetEmailOnDeadLetter returns the EmailOnDeadLetter field if non-nil, zero value otherwise.

### GetEmailOnDeadLetterOk

`func (o *UpdateNotificationPreferences) GetEmailOnDeadLetterOk() (*bool, bool)`

GetEmailOnDeadLetterOk returns a tuple with the EmailOnDeadLetter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmailOnDeadLetter

`func (o *UpdateNotificationPreferences) SetEmailOnDeadLetter(v bool)`

SetEmailOnDeadLetter sets EmailOnDeadLetter field to given value.


### GetEmailOnSuccess

`func (o *UpdateNotificationPreferences) GetEmailOnSuccess() bool`

GetEmailOnSuccess returns the EmailOnSuccess field if non-nil, zero value otherwise.

### GetEmailOnSuccessOk

`func (o *UpdateNotificationPreferences) GetEmailOnSuccessOk() (*bool, bool)`

GetEmailOnSuccessOk returns a tuple with the EmailOnSuccess field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmailOnSuccess

`func (o *UpdateNotificationPreferences) SetEmailOnSuccess(v bool)`

SetEmailOnSuccess sets EmailOnSuccess field to given value.


### GetSlackWebhookUrl

`func (o *UpdateNotificationPreferences) GetSlackWebhookUrl() string`

GetSlackWebhookUrl returns the SlackWebhookUrl field if non-nil, zero value otherwise.

### GetSlackWebhookUrlOk

`func (o *UpdateNotificationPreferences) GetSlackWebhookUrlOk() (*string, bool)`

GetSlackWebhookUrlOk returns a tuple with the SlackWebhookUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSlackWebhookUrl

`func (o *UpdateNotificationPreferences) SetSlackWebhookUrl(v string)`

SetSlackWebhookUrl sets SlackWebhookUrl field to given value.

### HasSlackWebhookUrl

`func (o *UpdateNotificationPreferences) HasSlackWebhookUrl() bool`

HasSlackWebhookUrl returns a boolean if a field has been set.

### SetSlackWebhookUrlNil

`func (o *UpdateNotificationPreferences) SetSlackWebhookUrlNil(b bool)`

 SetSlackWebhookUrlNil sets the value for SlackWebhookUrl to be an explicit nil

### UnsetSlackWebhookUrl
`func (o *UpdateNotificationPreferences) UnsetSlackWebhookUrl()`

UnsetSlackWebhookUrl ensures that no value is present for SlackWebhookUrl, not even an explicit nil
### GetDiscordWebhookUrl

`func (o *UpdateNotificationPreferences) GetDiscordWebhookUrl() string`

GetDiscordWebhookUrl returns the DiscordWebhookUrl field if non-nil, zero value otherwise.

### GetDiscordWebhookUrlOk

`func (o *UpdateNotificationPreferences) GetDiscordWebhookUrlOk() (*string, bool)`

GetDiscordWebhookUrlOk returns a tuple with the DiscordWebhookUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDiscordWebhookUrl

`func (o *UpdateNotificationPreferences) SetDiscordWebhookUrl(v string)`

SetDiscordWebhookUrl sets DiscordWebhookUrl field to given value.

### HasDiscordWebhookUrl

`func (o *UpdateNotificationPreferences) HasDiscordWebhookUrl() bool`

HasDiscordWebhookUrl returns a boolean if a field has been set.

### SetDiscordWebhookUrlNil

`func (o *UpdateNotificationPreferences) SetDiscordWebhookUrlNil(b bool)`

 SetDiscordWebhookUrlNil sets the value for DiscordWebhookUrl to be an explicit nil

### UnsetDiscordWebhookUrl
`func (o *UpdateNotificationPreferences) UnsetDiscordWebhookUrl()`

UnsetDiscordWebhookUrl ensures that no value is present for DiscordWebhookUrl, not even an explicit nil
### GetWebhookUrl

`func (o *UpdateNotificationPreferences) GetWebhookUrl() string`

GetWebhookUrl returns the WebhookUrl field if non-nil, zero value otherwise.

### GetWebhookUrlOk

`func (o *UpdateNotificationPreferences) GetWebhookUrlOk() (*string, bool)`

GetWebhookUrlOk returns a tuple with the WebhookUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookUrl

`func (o *UpdateNotificationPreferences) SetWebhookUrl(v string)`

SetWebhookUrl sets WebhookUrl field to given value.

### HasWebhookUrl

`func (o *UpdateNotificationPreferences) HasWebhookUrl() bool`

HasWebhookUrl returns a boolean if a field has been set.

### SetWebhookUrlNil

`func (o *UpdateNotificationPreferences) SetWebhookUrlNil(b bool)`

 SetWebhookUrlNil sets the value for WebhookUrl to be an explicit nil

### UnsetWebhookUrl
`func (o *UpdateNotificationPreferences) UnsetWebhookUrl()`

UnsetWebhookUrl ensures that no value is present for WebhookUrl, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


