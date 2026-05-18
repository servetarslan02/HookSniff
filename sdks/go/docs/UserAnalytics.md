# UserAnalytics

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**DailyDeliveries** | [**[]DailyDeliveryCount**](DailyDeliveryCount.md) |  | 
**TopEvents** | [**[]EventTypeCount**](EventTypeCount.md) |  | 
**EndpointHealth** | [**[]EndpointHealth**](EndpointHealth.md) |  | 

## Methods

### NewUserAnalytics

`func NewUserAnalytics(dailyDeliveries []DailyDeliveryCount, topEvents []EventTypeCount, endpointHealth []EndpointHealth, ) *UserAnalytics`

NewUserAnalytics instantiates a new UserAnalytics object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUserAnalyticsWithDefaults

`func NewUserAnalyticsWithDefaults() *UserAnalytics`

NewUserAnalyticsWithDefaults instantiates a new UserAnalytics object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDailyDeliveries

`func (o *UserAnalytics) GetDailyDeliveries() []DailyDeliveryCount`

GetDailyDeliveries returns the DailyDeliveries field if non-nil, zero value otherwise.

### GetDailyDeliveriesOk

`func (o *UserAnalytics) GetDailyDeliveriesOk() (*[]DailyDeliveryCount, bool)`

GetDailyDeliveriesOk returns a tuple with the DailyDeliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDailyDeliveries

`func (o *UserAnalytics) SetDailyDeliveries(v []DailyDeliveryCount)`

SetDailyDeliveries sets DailyDeliveries field to given value.


### GetTopEvents

`func (o *UserAnalytics) GetTopEvents() []EventTypeCount`

GetTopEvents returns the TopEvents field if non-nil, zero value otherwise.

### GetTopEventsOk

`func (o *UserAnalytics) GetTopEventsOk() (*[]EventTypeCount, bool)`

GetTopEventsOk returns a tuple with the TopEvents field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTopEvents

`func (o *UserAnalytics) SetTopEvents(v []EventTypeCount)`

SetTopEvents sets TopEvents field to given value.


### GetEndpointHealth

`func (o *UserAnalytics) GetEndpointHealth() []EndpointHealth`

GetEndpointHealth returns the EndpointHealth field if non-nil, zero value otherwise.

### GetEndpointHealthOk

`func (o *UserAnalytics) GetEndpointHealthOk() (*[]EndpointHealth, bool)`

GetEndpointHealthOk returns a tuple with the EndpointHealth field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointHealth

`func (o *UserAnalytics) SetEndpointHealth(v []EndpointHealth)`

SetEndpointHealth sets EndpointHealth field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


