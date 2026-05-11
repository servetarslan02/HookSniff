# DeliveryAttempt

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**AttemptNumber** | **int32** |  | 
**StatusCode** | Pointer to **NullableInt32** |  | [optional] 
**ResponseBody** | Pointer to **NullableString** |  | [optional] 
**DurationMs** | Pointer to **NullableInt32** |  | [optional] 
**ErrorMessage** | Pointer to **NullableString** |  | [optional] 
**CreatedAt** | **time.Time** |  | 

## Methods

### NewDeliveryAttempt

`func NewDeliveryAttempt(id string, attemptNumber int32, createdAt time.Time, ) *DeliveryAttempt`

NewDeliveryAttempt instantiates a new DeliveryAttempt object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeliveryAttemptWithDefaults

`func NewDeliveryAttemptWithDefaults() *DeliveryAttempt`

NewDeliveryAttemptWithDefaults instantiates a new DeliveryAttempt object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *DeliveryAttempt) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *DeliveryAttempt) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *DeliveryAttempt) SetId(v string)`

SetId sets Id field to given value.


### GetAttemptNumber

`func (o *DeliveryAttempt) GetAttemptNumber() int32`

GetAttemptNumber returns the AttemptNumber field if non-nil, zero value otherwise.

### GetAttemptNumberOk

`func (o *DeliveryAttempt) GetAttemptNumberOk() (*int32, bool)`

GetAttemptNumberOk returns a tuple with the AttemptNumber field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAttemptNumber

`func (o *DeliveryAttempt) SetAttemptNumber(v int32)`

SetAttemptNumber sets AttemptNumber field to given value.


### GetStatusCode

`func (o *DeliveryAttempt) GetStatusCode() int32`

GetStatusCode returns the StatusCode field if non-nil, zero value otherwise.

### GetStatusCodeOk

`func (o *DeliveryAttempt) GetStatusCodeOk() (*int32, bool)`

GetStatusCodeOk returns a tuple with the StatusCode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatusCode

`func (o *DeliveryAttempt) SetStatusCode(v int32)`

SetStatusCode sets StatusCode field to given value.

### HasStatusCode

`func (o *DeliveryAttempt) HasStatusCode() bool`

HasStatusCode returns a boolean if a field has been set.

### SetStatusCodeNil

`func (o *DeliveryAttempt) SetStatusCodeNil(b bool)`

 SetStatusCodeNil sets the value for StatusCode to be an explicit nil

### UnsetStatusCode
`func (o *DeliveryAttempt) UnsetStatusCode()`

UnsetStatusCode ensures that no value is present for StatusCode, not even an explicit nil
### GetResponseBody

`func (o *DeliveryAttempt) GetResponseBody() string`

GetResponseBody returns the ResponseBody field if non-nil, zero value otherwise.

### GetResponseBodyOk

`func (o *DeliveryAttempt) GetResponseBodyOk() (*string, bool)`

GetResponseBodyOk returns a tuple with the ResponseBody field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResponseBody

`func (o *DeliveryAttempt) SetResponseBody(v string)`

SetResponseBody sets ResponseBody field to given value.

### HasResponseBody

`func (o *DeliveryAttempt) HasResponseBody() bool`

HasResponseBody returns a boolean if a field has been set.

### SetResponseBodyNil

`func (o *DeliveryAttempt) SetResponseBodyNil(b bool)`

 SetResponseBodyNil sets the value for ResponseBody to be an explicit nil

### UnsetResponseBody
`func (o *DeliveryAttempt) UnsetResponseBody()`

UnsetResponseBody ensures that no value is present for ResponseBody, not even an explicit nil
### GetDurationMs

`func (o *DeliveryAttempt) GetDurationMs() int32`

GetDurationMs returns the DurationMs field if non-nil, zero value otherwise.

### GetDurationMsOk

`func (o *DeliveryAttempt) GetDurationMsOk() (*int32, bool)`

GetDurationMsOk returns a tuple with the DurationMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDurationMs

`func (o *DeliveryAttempt) SetDurationMs(v int32)`

SetDurationMs sets DurationMs field to given value.

### HasDurationMs

`func (o *DeliveryAttempt) HasDurationMs() bool`

HasDurationMs returns a boolean if a field has been set.

### SetDurationMsNil

`func (o *DeliveryAttempt) SetDurationMsNil(b bool)`

 SetDurationMsNil sets the value for DurationMs to be an explicit nil

### UnsetDurationMs
`func (o *DeliveryAttempt) UnsetDurationMs()`

UnsetDurationMs ensures that no value is present for DurationMs, not even an explicit nil
### GetErrorMessage

`func (o *DeliveryAttempt) GetErrorMessage() string`

GetErrorMessage returns the ErrorMessage field if non-nil, zero value otherwise.

### GetErrorMessageOk

`func (o *DeliveryAttempt) GetErrorMessageOk() (*string, bool)`

GetErrorMessageOk returns a tuple with the ErrorMessage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrorMessage

`func (o *DeliveryAttempt) SetErrorMessage(v string)`

SetErrorMessage sets ErrorMessage field to given value.

### HasErrorMessage

`func (o *DeliveryAttempt) HasErrorMessage() bool`

HasErrorMessage returns a boolean if a field has been set.

### SetErrorMessageNil

`func (o *DeliveryAttempt) SetErrorMessageNil(b bool)`

 SetErrorMessageNil sets the value for ErrorMessage to be an explicit nil

### UnsetErrorMessage
`func (o *DeliveryAttempt) UnsetErrorMessage()`

UnsetErrorMessage ensures that no value is present for ErrorMessage, not even an explicit nil
### GetCreatedAt

`func (o *DeliveryAttempt) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *DeliveryAttempt) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *DeliveryAttempt) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


