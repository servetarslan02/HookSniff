# AdminCreateAlertRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CustomerId** | Pointer to **string** |  | [optional] 
**Name** | **string** |  | 
**Condition** | **string** |  | 
**Threshold** | **int32** |  | 
**Channels** | **[]string** |  | 

## Methods

### NewAdminCreateAlertRequest

`func NewAdminCreateAlertRequest(name string, condition string, threshold int32, channels []string, ) *AdminCreateAlertRequest`

NewAdminCreateAlertRequest instantiates a new AdminCreateAlertRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminCreateAlertRequestWithDefaults

`func NewAdminCreateAlertRequestWithDefaults() *AdminCreateAlertRequest`

NewAdminCreateAlertRequestWithDefaults instantiates a new AdminCreateAlertRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCustomerId

`func (o *AdminCreateAlertRequest) GetCustomerId() string`

GetCustomerId returns the CustomerId field if non-nil, zero value otherwise.

### GetCustomerIdOk

`func (o *AdminCreateAlertRequest) GetCustomerIdOk() (*string, bool)`

GetCustomerIdOk returns a tuple with the CustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomerId

`func (o *AdminCreateAlertRequest) SetCustomerId(v string)`

SetCustomerId sets CustomerId field to given value.

### HasCustomerId

`func (o *AdminCreateAlertRequest) HasCustomerId() bool`

HasCustomerId returns a boolean if a field has been set.

### GetName

`func (o *AdminCreateAlertRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *AdminCreateAlertRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *AdminCreateAlertRequest) SetName(v string)`

SetName sets Name field to given value.


### GetCondition

`func (o *AdminCreateAlertRequest) GetCondition() string`

GetCondition returns the Condition field if non-nil, zero value otherwise.

### GetConditionOk

`func (o *AdminCreateAlertRequest) GetConditionOk() (*string, bool)`

GetConditionOk returns a tuple with the Condition field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCondition

`func (o *AdminCreateAlertRequest) SetCondition(v string)`

SetCondition sets Condition field to given value.


### GetThreshold

`func (o *AdminCreateAlertRequest) GetThreshold() int32`

GetThreshold returns the Threshold field if non-nil, zero value otherwise.

### GetThresholdOk

`func (o *AdminCreateAlertRequest) GetThresholdOk() (*int32, bool)`

GetThresholdOk returns a tuple with the Threshold field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetThreshold

`func (o *AdminCreateAlertRequest) SetThreshold(v int32)`

SetThreshold sets Threshold field to given value.


### GetChannels

`func (o *AdminCreateAlertRequest) GetChannels() []string`

GetChannels returns the Channels field if non-nil, zero value otherwise.

### GetChannelsOk

`func (o *AdminCreateAlertRequest) GetChannelsOk() (*[]string, bool)`

GetChannelsOk returns a tuple with the Channels field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChannels

`func (o *AdminCreateAlertRequest) SetChannels(v []string)`

SetChannels sets Channels field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


