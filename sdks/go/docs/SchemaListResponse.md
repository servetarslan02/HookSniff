# SchemaListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | [**[]SchemaResponse**](SchemaResponse.md) |  | 
**HasMore** | **bool** |  | 
**Total** | **int32** |  | 

## Methods

### NewSchemaListResponse

`func NewSchemaListResponse(data []SchemaResponse, hasMore bool, total int32, ) *SchemaListResponse`

NewSchemaListResponse instantiates a new SchemaListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSchemaListResponseWithDefaults

`func NewSchemaListResponseWithDefaults() *SchemaListResponse`

NewSchemaListResponseWithDefaults instantiates a new SchemaListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *SchemaListResponse) GetData() []SchemaResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *SchemaListResponse) GetDataOk() (*[]SchemaResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *SchemaListResponse) SetData(v []SchemaResponse)`

SetData sets Data field to given value.


### GetHasMore

`func (o *SchemaListResponse) GetHasMore() bool`

GetHasMore returns the HasMore field if non-nil, zero value otherwise.

### GetHasMoreOk

`func (o *SchemaListResponse) GetHasMoreOk() (*bool, bool)`

GetHasMoreOk returns a tuple with the HasMore field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasMore

`func (o *SchemaListResponse) SetHasMore(v bool)`

SetHasMore sets HasMore field to given value.


### GetTotal

`func (o *SchemaListResponse) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *SchemaListResponse) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *SchemaListResponse) SetTotal(v int32)`

SetTotal sets Total field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


