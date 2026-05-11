# ApplyTemplateRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **string** |  | 
**Variables** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewApplyTemplateRequest

`func NewApplyTemplateRequest(endpointId string, ) *ApplyTemplateRequest`

NewApplyTemplateRequest instantiates a new ApplyTemplateRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewApplyTemplateRequestWithDefaults

`func NewApplyTemplateRequestWithDefaults() *ApplyTemplateRequest`

NewApplyTemplateRequestWithDefaults instantiates a new ApplyTemplateRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEndpointId

`func (o *ApplyTemplateRequest) GetEndpointId() string`

GetEndpointId returns the EndpointId field if non-nil, zero value otherwise.

### GetEndpointIdOk

`func (o *ApplyTemplateRequest) GetEndpointIdOk() (*string, bool)`

GetEndpointIdOk returns a tuple with the EndpointId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpointId

`func (o *ApplyTemplateRequest) SetEndpointId(v string)`

SetEndpointId sets EndpointId field to given value.


### GetVariables

`func (o *ApplyTemplateRequest) GetVariables() map[string]interface{}`

GetVariables returns the Variables field if non-nil, zero value otherwise.

### GetVariablesOk

`func (o *ApplyTemplateRequest) GetVariablesOk() (*map[string]interface{}, bool)`

GetVariablesOk returns a tuple with the Variables field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVariables

`func (o *ApplyTemplateRequest) SetVariables(v map[string]interface{})`

SetVariables sets Variables field to given value.

### HasVariables

`func (o *ApplyTemplateRequest) HasVariables() bool`

HasVariables returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


