# SchemaResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** |  | 
**Name** | **string** |  | 
**Version** | **int32** |  | 
**SchemaJson** | **map[string]interface{}** | The JSON Schema document | 
**CreatedAt** | **time.Time** |  | 

## Methods

### NewSchemaResponse

`func NewSchemaResponse(id string, name string, version int32, schemaJson map[string]interface{}, createdAt time.Time, ) *SchemaResponse`

NewSchemaResponse instantiates a new SchemaResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSchemaResponseWithDefaults

`func NewSchemaResponseWithDefaults() *SchemaResponse`

NewSchemaResponseWithDefaults instantiates a new SchemaResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *SchemaResponse) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *SchemaResponse) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *SchemaResponse) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *SchemaResponse) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *SchemaResponse) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *SchemaResponse) SetName(v string)`

SetName sets Name field to given value.


### GetVersion

`func (o *SchemaResponse) GetVersion() int32`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *SchemaResponse) GetVersionOk() (*int32, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *SchemaResponse) SetVersion(v int32)`

SetVersion sets Version field to given value.


### GetSchemaJson

`func (o *SchemaResponse) GetSchemaJson() map[string]interface{}`

GetSchemaJson returns the SchemaJson field if non-nil, zero value otherwise.

### GetSchemaJsonOk

`func (o *SchemaResponse) GetSchemaJsonOk() (*map[string]interface{}, bool)`

GetSchemaJsonOk returns a tuple with the SchemaJson field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSchemaJson

`func (o *SchemaResponse) SetSchemaJson(v map[string]interface{})`

SetSchemaJson sets SchemaJson field to given value.


### GetCreatedAt

`func (o *SchemaResponse) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *SchemaResponse) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *SchemaResponse) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


