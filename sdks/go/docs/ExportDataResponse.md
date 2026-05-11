# ExportDataResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**User** | Pointer to [**CustomerResponse**](CustomerResponse.md) |  | [optional] 
**Endpoints** | Pointer to [**[]Endpoint**](Endpoint.md) |  | [optional] 
**Deliveries** | Pointer to [**[]Delivery**](Delivery.md) |  | [optional] 
**Teams** | Pointer to [**[]Team**](Team.md) |  | [optional] 
**ExportedAt** | **time.Time** |  | 

## Methods

### NewExportDataResponse

`func NewExportDataResponse(exportedAt time.Time, ) *ExportDataResponse`

NewExportDataResponse instantiates a new ExportDataResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewExportDataResponseWithDefaults

`func NewExportDataResponseWithDefaults() *ExportDataResponse`

NewExportDataResponseWithDefaults instantiates a new ExportDataResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUser

`func (o *ExportDataResponse) GetUser() CustomerResponse`

GetUser returns the User field if non-nil, zero value otherwise.

### GetUserOk

`func (o *ExportDataResponse) GetUserOk() (*CustomerResponse, bool)`

GetUserOk returns a tuple with the User field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUser

`func (o *ExportDataResponse) SetUser(v CustomerResponse)`

SetUser sets User field to given value.

### HasUser

`func (o *ExportDataResponse) HasUser() bool`

HasUser returns a boolean if a field has been set.

### GetEndpoints

`func (o *ExportDataResponse) GetEndpoints() []Endpoint`

GetEndpoints returns the Endpoints field if non-nil, zero value otherwise.

### GetEndpointsOk

`func (o *ExportDataResponse) GetEndpointsOk() (*[]Endpoint, bool)`

GetEndpointsOk returns a tuple with the Endpoints field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpoints

`func (o *ExportDataResponse) SetEndpoints(v []Endpoint)`

SetEndpoints sets Endpoints field to given value.

### HasEndpoints

`func (o *ExportDataResponse) HasEndpoints() bool`

HasEndpoints returns a boolean if a field has been set.

### GetDeliveries

`func (o *ExportDataResponse) GetDeliveries() []Delivery`

GetDeliveries returns the Deliveries field if non-nil, zero value otherwise.

### GetDeliveriesOk

`func (o *ExportDataResponse) GetDeliveriesOk() (*[]Delivery, bool)`

GetDeliveriesOk returns a tuple with the Deliveries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDeliveries

`func (o *ExportDataResponse) SetDeliveries(v []Delivery)`

SetDeliveries sets Deliveries field to given value.

### HasDeliveries

`func (o *ExportDataResponse) HasDeliveries() bool`

HasDeliveries returns a boolean if a field has been set.

### GetTeams

`func (o *ExportDataResponse) GetTeams() []Team`

GetTeams returns the Teams field if non-nil, zero value otherwise.

### GetTeamsOk

`func (o *ExportDataResponse) GetTeamsOk() (*[]Team, bool)`

GetTeamsOk returns a tuple with the Teams field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTeams

`func (o *ExportDataResponse) SetTeams(v []Team)`

SetTeams sets Teams field to given value.

### HasTeams

`func (o *ExportDataResponse) HasTeams() bool`

HasTeams returns a boolean if a field has been set.

### GetExportedAt

`func (o *ExportDataResponse) GetExportedAt() time.Time`

GetExportedAt returns the ExportedAt field if non-nil, zero value otherwise.

### GetExportedAtOk

`func (o *ExportDataResponse) GetExportedAtOk() (*time.Time, bool)`

GetExportedAtOk returns a tuple with the ExportedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetExportedAt

`func (o *ExportDataResponse) SetExportedAt(v time.Time)`

SetExportedAt sets ExportedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


