# SimulatorResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**DeliveryId** | **string** |  | 
**Status** | **string** |  | 
**LatencyMs** | **int32** | Response time from the endpoint | 

## Methods

### NewSimulatorResponse

`func NewSimulatorResponse(deliveryId string, status string, latencyMs int32, ) *SimulatorResponse`

NewSimulatorResponse instantiates a new SimulatorResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSimulatorResponseWithDefaults

`func NewSimulatorResponseWithDefaults() *SimulatorResponse`

NewSimulatorResponseWithDefaults instantiates a new SimulatorResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDeliveryId

`func (o *SimulatorResponse) GetDeliveryId() string`

GetDeliveryId returns the DeliveryId field if non-nil, zero value otherwise.

### GetDeliveryIdOk

`func (o *SimulatorResponse) GetDeliveryIdOk() (*string, bool)`

GetDeliveryIdOk returns a tuple with the DeliveryId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDeliveryId

`func (o *SimulatorResponse) SetDeliveryId(v string)`

SetDeliveryId sets DeliveryId field to given value.


### GetStatus

`func (o *SimulatorResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *SimulatorResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *SimulatorResponse) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetLatencyMs

`func (o *SimulatorResponse) GetLatencyMs() int32`

GetLatencyMs returns the LatencyMs field if non-nil, zero value otherwise.

### GetLatencyMsOk

`func (o *SimulatorResponse) GetLatencyMsOk() (*int32, bool)`

GetLatencyMsOk returns a tuple with the LatencyMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLatencyMs

`func (o *SimulatorResponse) SetLatencyMs(v int32)`

SetLatencyMs sets LatencyMs field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


