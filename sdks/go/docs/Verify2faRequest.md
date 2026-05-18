# Verify2faRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**TempToken** | **string** |  | 
**Code** | **string** |  | 

## Methods

### NewVerify2faRequest

`func NewVerify2faRequest(tempToken string, code string, ) *Verify2faRequest`

NewVerify2faRequest instantiates a new Verify2faRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewVerify2faRequestWithDefaults

`func NewVerify2faRequestWithDefaults() *Verify2faRequest`

NewVerify2faRequestWithDefaults instantiates a new Verify2faRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTempToken

`func (o *Verify2faRequest) GetTempToken() string`

GetTempToken returns the TempToken field if non-nil, zero value otherwise.

### GetTempTokenOk

`func (o *Verify2faRequest) GetTempTokenOk() (*string, bool)`

GetTempTokenOk returns a tuple with the TempToken field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTempToken

`func (o *Verify2faRequest) SetTempToken(v string)`

SetTempToken sets TempToken field to given value.


### GetCode

`func (o *Verify2faRequest) GetCode() string`

GetCode returns the Code field if non-nil, zero value otherwise.

### GetCodeOk

`func (o *Verify2faRequest) GetCodeOk() (*string, bool)`

GetCodeOk returns a tuple with the Code field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCode

`func (o *Verify2faRequest) SetCode(v string)`

SetCode sets Code field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


