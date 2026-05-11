# WebhookFilter

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **string** | Filter by delivery status | 
**EndpointId** | **string** |  | 
**EventType** | **string** | Filter by event type (e.g. order.created) | 
**FromDate** | **time.Time** |  | 
**ToDate** | **time.Time** |  | 
**Page** | **int32** |  | [default to 1]
**PerPage** | **int32** |  | [default to 20]

## Methods

### NewWebhookFilter

`func NewWebhookFilter(status string, endpointId string, eventType string, fromDate time.Time, toDate time.Time, page int32, perPage int32, ) *WebhookFilter`

NewWebhookFilter instantiates a new WebhookFilter object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWebhookFilterWithDefaults

`func NewWebhookFilterWithDefaults() *WebhookFilter`

NewWebhookFilterWithDefaults instantiates a new WebhookFilter object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *WebhookFilter) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *WebhookFilter) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *WebhookFilter) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetEndpointId

`func (o *WebhookFilter) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *WebhookFilter) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *WebhookFilter) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetEventType

`func (o *WebhookFilter) GetEventType() string`

GetEventType returns the EventType field if non-nil, zero value otherwise.

### GetEventTypeOk

`func (o *WebhookFilter) GetEventTypeOk() (*string, bool)`

GetEventTypeOk returns a tuple with the EventType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventType

`func (o *WebhookFilter) SetEventType(v string)`

SetEventType sets EventType field to given value.


### GetFromDate

`func (o *WebhookFilter) GetFromDate() time.Time`

GetFromDate returns the FromDate field if non-nil, zero value otherwise.

### GetFromDateOk

`func (o *WebhookFilter) GetFromDateOk() (*time.Time, bool)`

GetFromDateOk returns a tuple with the FromDate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFromDate

`func (o *WebhookFilter) SetFromDate(v time.Time)`

SetFromDate sets FromDate field to given value.


### GetToDate

`func (o *WebhookFilter) GetToDate() time.Time`

GetToDate returns the ToDate field if non-nil, zero value otherwise.

### GetToDateOk

`func (o *WebhookFilter) GetToDateOk() (*time.Time, bool)`

GetToDateOk returns a tuple with the ToDate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToDate

`func (o *WebhookFilter) SetToDate(v time.Time)`

SetToDate sets ToDate field to given value.


### GetPage

`func (o *WebhookFilter) GetPage() int32`

GetPage returns the Page field if non-nil, zero value otherwise.

### GetPageOk

`func (o *WebhookFilter) GetPageOk() (*int32, bool)`

GetPageOk returns a tuple with the Page field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPage

`func (o *WebhookFilter) SetPage(v int32)`

SetPage sets Page field to given value.


### GetPerPage

`func (o *WebhookFilter) GetPerPage() int32`

GetPerPage returns the PerPage field if non-nil, zero value otherwise.

### GetPerPageOk

`func (o *WebhookFilter) GetPerPageOk() (*int32, bool)`

GetPerPageOk returns a tuple with the PerPage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPerPage

`func (o *WebhookFilter) SetPerPage(v int32)`

SetPerPage sets PerPage field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


