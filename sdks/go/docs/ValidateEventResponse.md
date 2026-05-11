# ValidateEventResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Valid** | **bool** |  | 
**Errors** | Pointer to [**[]ValidateEventResponseErrorsInner**](ValidateEventResponseErrorsInner.md) |  | [optional] 

## Methods

### NewValidateEventResponse

`func NewValidateEventResponse(valid bool, ) *ValidateEventResponse`

NewValidateEventResponse instantiates a new ValidateEventResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewValidateEventResponseWithDefaults

`func NewValidateEventResponseWithDefaults() *ValidateEventResponse`

NewValidateEventResponseWithDefaults instantiates a new ValidateEventResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetValid

`func (o *ValidateEventResponse) GetValid() bool`

GetValid returns the Valid field if non-nil, zero value otherwise.

### GetValidOk

`func (o *ValidateEventResponse) GetValidOk() (*bool, bool)`

GetValidOk returns a tuple with the Valid field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValid

`func (o *ValidateEventResponse) SetValid(v bool)`

SetValid sets Valid field to given value.


### GetErrors

`func (o *ValidateEventResponse) GetErrors() []ValidateEventResponseErrorsInner`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *ValidateEventResponse) GetErrorsOk() (*[]ValidateEventResponseErrorsInner, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *ValidateEventResponse) SetErrors(v []ValidateEventResponseErrorsInner)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *ValidateEventResponse) HasErrors() bool`

HasErrors returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


