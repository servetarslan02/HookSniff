# AdminAuditLogResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Entries** | [**[]AdminAuditEntry**](AdminAuditEntry.md) |  | 
**Total** | **int32** |  | 
**Page** | **int32** |  | 
**PerPage** | **int32** |  | 

## Methods

### NewAdminAuditLogResponse

`func NewAdminAuditLogResponse(entries []AdminAuditEntry, total int32, page int32, perPage int32, ) *AdminAuditLogResponse`

NewAdminAuditLogResponse instantiates a new AdminAuditLogResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAdminAuditLogResponseWithDefaults

`func NewAdminAuditLogResponseWithDefaults() *AdminAuditLogResponse`

NewAdminAuditLogResponseWithDefaults instantiates a new AdminAuditLogResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetEntries

`func (o *AdminAuditLogResponse) GetEntries() []AdminAuditEntry`

GetEntries returns the Entries field if non-nil, zero value otherwise.

### GetEntriesOk

`func (o *AdminAuditLogResponse) GetEntriesOk() (*[]AdminAuditEntry, bool)`

GetEntriesOk returns a tuple with the Entries field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEntries

`func (o *AdminAuditLogResponse) SetEntries(v []AdminAuditEntry)`

SetEntries sets Entries field to given value.


### GetTotal

`func (o *AdminAuditLogResponse) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *AdminAuditLogResponse) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *AdminAuditLogResponse) SetTotal(v int32)`

SetTotal sets Total field to given value.


### GetPage

`func (o *AdminAuditLogResponse) GetPage() int32`

GetPage returns the Page field if non-nil, zero value otherwise.

### GetPageOk

`func (o *AdminAuditLogResponse) GetPageOk() (*int32, bool)`

GetPageOk returns a tuple with the Page field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPage

`func (o *AdminAuditLogResponse) SetPage(v int32)`

SetPage sets Page field to given value.


### GetPerPage

`func (o *AdminAuditLogResponse) GetPerPage() int32`

GetPerPage returns the PerPage field if non-nil, zero value otherwise.

### GetPerPageOk

`func (o *AdminAuditLogResponse) GetPerPageOk() (*int32, bool)`

GetPerPageOk returns a tuple with the PerPage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPerPage

`func (o *AdminAuditLogResponse) SetPerPage(v int32)`

SetPerPage sets PerPage field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


