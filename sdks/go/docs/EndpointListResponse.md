# EndpointListResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | [**[]Endpoint**](Endpoint.md) |  | 
**Total** | **int32** |  | 
**HasMore** | **bool** |  | 

## Methods

### NewEndpointListResponse

`func NewEndpointListResponse(data []Endpoint, total int32, hasMore bool, ) *EndpointListResponse`

NewEndpointListResponse instantiates a new EndpointListResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEndpointListResponseWithDefaults

`func NewEndpointListResponseWithDefaults() *EndpointListResponse`

NewEndpointListResponseWithDefaults instantiates a new EndpointListResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *EndpointListResponse) GetData() []Endpoint`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *EndpointListResponse) GetDataOk() (*[]Endpoint, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *EndpointListResponse) SetData(v []Endpoint)`

SetData sets Data field to given value.


### GetTotal

`func (o *EndpointListResponse) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *EndpointListResponse) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *EndpointListResponse) SetTotal(v int32)`

SetTotal sets Total field to given value.


### GetHasMore

`func (o *EndpointListResponse) GetHasMore() bool`

GetHasMore returns the HasMore field if non-nil, zero value otherwise.

### GetHasMoreOk

`func (o *EndpointListResponse) GetHasMoreOk() (*bool, bool)`

GetHasMoreOk returns a tuple with the HasMore field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasMore

`func (o *EndpointListResponse) SetHasMore(v bool)`

SetHasMore sets HasMore field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


