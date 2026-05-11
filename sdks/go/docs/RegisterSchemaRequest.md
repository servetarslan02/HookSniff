# RegisterSchemaRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**Schema** | **map[string]interface{}** | JSON Schema document | 

## Methods

### NewRegisterSchemaRequest

`func NewRegisterSchemaRequest(name string, schema map[string]interface{}, ) *RegisterSchemaRequest`

NewRegisterSchemaRequest instantiates a new RegisterSchemaRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRegisterSchemaRequestWithDefaults

`func NewRegisterSchemaRequestWithDefaults() *RegisterSchemaRequest`

NewRegisterSchemaRequestWithDefaults instantiates a new RegisterSchemaRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *RegisterSchemaRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *RegisterSchemaRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *RegisterSchemaRequest) SetName(v string)`

SetName sets Name field to given value.


### GetSchema

`func (o *RegisterSchemaRequest) GetSchema() map[string]interface{}`

GetSchema returns the Schema field if non-nil, zero value otherwise.

### GetSchemaOk

`func (o *RegisterSchemaRequest) GetSchemaOk() (*map[string]interface{}, bool)`

GetSchemaOk returns a tuple with the Schema field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSchema

`func (o *RegisterSchemaRequest) SetSchema(v map[string]interface{})`

SetSchema sets Schema field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


