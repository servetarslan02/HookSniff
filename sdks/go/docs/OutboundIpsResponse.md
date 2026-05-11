# OutboundIpsResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Ips** | **[]string** |  | 
**UpdatedAt** | **string** |  | 

## Methods

### NewOutboundIpsResponse

`func NewOutboundIpsResponse(ips []string, updatedAt string, ) *OutboundIpsResponse`

NewOutboundIpsResponse instantiates a new OutboundIpsResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewOutboundIpsResponseWithDefaults

`func NewOutboundIpsResponseWithDefaults() *OutboundIpsResponse`

NewOutboundIpsResponseWithDefaults instantiates a new OutboundIpsResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetIps

`func (o *OutboundIpsResponse) GetIps() []string`

GetIps returns the Ips field if non-nil, zero value otherwise.

### GetIpsOk

`func (o *OutboundIpsResponse) GetIpsOk() (*[]string, bool)`

GetIpsOk returns a tuple with the Ips field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIps

`func (o *OutboundIpsResponse) SetIps(v []string)`

SetIps sets Ips field to given value.


### GetUpdatedAt

`func (o *OutboundIpsResponse) GetUpdatedAt() string`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *OutboundIpsResponse) GetUpdatedAtOk() (*string, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *OutboundIpsResponse) SetUpdatedAt(v string)`

SetUpdatedAt sets UpdatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


