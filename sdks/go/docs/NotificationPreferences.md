# NotificationPreferences

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EmailOnFailure** | **bool** |  | [default to true]
**EmailOnDeadLetter** | **bool** |  | [default to true]
**EmailOnSuccess** | **bool** |  | [default to false]
**SlackWebhookUrl** | Pointer to **NullableString** |  | [optional] 
**DiscordWebhookUrl** | Pointer to **NullableString** |  | [optional] 
**WebhookUrl** | Pointer to **NullableString** |  | [optional] 

## Methods

### NewNotificationPreferences

`func NewNotificationPreferences(emailOnFailure bool, emailOnDeadLetter bool, emailOnSuccess bool, ) *NotificationPreferences`

NewNotificationPreferences instantiates a new NotificationPreferences object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewNotificationPreferencesWithDefaults

`func NewNotificationPreferencesWithDefaults() *NotificationPreferences`

NewNotificationPreferencesWithDefaults instantiates a new NotificationPreferences object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEmailOnFailure

`func (o *NotificationPreferences) GetEmailOnFailure() bool`

GetEmailOnFailure returns the EmailOnFailure field if non-nil, zero value otherwise.

### GetEmailOnFailureOk

`func (o *NotificationPreferences) GetEmailOnFailureOk() (*bool, bool)`

GetEmailOnFailureOk returns a tuple with the EmailOnFailure field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmailOnFailure

`func (o *NotificationPreferences) SetEmailOnFailure(v bool)`

SetEmailOnFailure sets EmailOnFailure field to given value.


### GetEmailOnDeadLetter

`func (o *NotificationPreferences) GetEmailOnDeadLetter() bool`

GetEmailOnDeadLetter returns the EmailOnDeadLetter field if non-nil, zero value otherwise.

### GetEmailOnDeadLetterOk

`func (o *NotificationPreferences) GetEmailOnDeadLetterOk() (*bool, bool)`

GetEmailOnDeadLetterOk returns a tuple with the EmailOnDeadLetter field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmailOnDeadLetter

`func (o *NotificationPreferences) SetEmailOnDeadLetter(v bool)`

SetEmailOnDeadLetter sets EmailOnDeadLetter field to given value.


### GetEmailOnSuccess

`func (o *NotificationPreferences) GetEmailOnSuccess() bool`

GetEmailOnSuccess returns the EmailOnSuccess field if non-nil, zero value otherwise.

### GetEmailOnSuccessOk

`func (o *NotificationPreferences) GetEmailOnSuccessOk() (*bool, bool)`

GetEmailOnSuccessOk returns a tuple with the EmailOnSuccess field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmailOnSuccess

`func (o *NotificationPreferences) SetEmailOnSuccess(v bool)`

SetEmailOnSuccess sets EmailOnSuccess field to given value.


### GetSlackWebhookUrl

`func (o *NotificationPreferences) GetSlackWebhookUrl() string`

GetSlackWebhookUrl returns the SlackWebhookUrl field if non-nil, zero value otherwise.

### GetSlackWebhookUrlOk

`func (o *NotificationPreferences) GetSlackWebhookUrlOk() (*string, bool)`

GetSlackWebhookUrlOk returns a tuple with the SlackWebhookUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSlackWebhookUrl

`func (o *NotificationPreferences) SetSlackWebhookUrl(v string)`

SetSlackWebhookUrl sets SlackWebhookUrl field to given value.

### HasSlackWebhookUrl

`func (o *NotificationPreferences) HasSlackWebhookUrl() bool`

HasSlackWebhookUrl returns a boolean if a field has been set.

### SetSlackWebhookUrlNil

`func (o *NotificationPreferences) SetSlackWebhookUrlNil(b bool)`

 SetSlackWebhookUrlNil sets the value for SlackWebhookUrl to be an explicit nil

### UnsetSlackWebhookUrl
`func (o *NotificationPreferences) UnsetSlackWebhookUrl()`

UnsetSlackWebhookUrl ensures that no value is present for SlackWebhookUrl, not even an explicit nil
### GetDiscordWebhookUrl

`func (o *NotificationPreferences) GetDiscordWebhookUrl() string`

GetDiscordWebhookUrl returns the DiscordWebhookUrl field if non-nil, zero value otherwise.

### GetDiscordWebhookUrlOk

`func (o *NotificationPreferences) GetDiscordWebhookUrlOk() (*string, bool)`

GetDiscordWebhookUrlOk returns a tuple with the DiscordWebhookUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDiscordWebhookUrl

`func (o *NotificationPreferences) SetDiscordWebhookUrl(v string)`

SetDiscordWebhookUrl sets DiscordWebhookUrl field to given value.

### HasDiscordWebhookUrl

`func (o *NotificationPreferences) HasDiscordWebhookUrl() bool`

HasDiscordWebhookUrl returns a boolean if a field has been set.

### SetDiscordWebhookUrlNil

`func (o *NotificationPreferences) SetDiscordWebhookUrlNil(b bool)`

 SetDiscordWebhookUrlNil sets the value for DiscordWebhookUrl to be an explicit nil

### UnsetDiscordWebhookUrl
`func (o *NotificationPreferences) UnsetDiscordWebhookUrl()`

UnsetDiscordWebhookUrl ensures that no value is present for DiscordWebhookUrl, not even an explicit nil
### GetWebhookUrl

`func (o *NotificationPreferences) GetWebhookUrl() string`

GetWebhookUrl returns the WebhookUrl field if non-nil, zero value otherwise.

### GetWebhookUrlOk

`func (o *NotificationPreferences) GetWebhookUrlOk() (*string, bool)`

GetWebhookUrlOk returns a tuple with the WebhookUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookUrl

`func (o *NotificationPreferences) SetWebhookUrl(v string)`

SetWebhookUrl sets WebhookUrl field to given value.

### HasWebhookUrl

`func (o *NotificationPreferences) HasWebhookUrl() bool`

HasWebhookUrl returns a boolean if a field has been set.

### SetWebhookUrlNil

`func (o *NotificationPreferences) SetWebhookUrlNil(b bool)`

 SetWebhookUrlNil sets the value for WebhookUrl to be an explicit nil

### UnsetWebhookUrl
`func (o *NotificationPreferences) UnsetWebhookUrl()`

UnsetWebhookUrl ensures that no value is present for WebhookUrl, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


