# DomainDnsRecord

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Type** | **string** |  | 
**Name** | **string** | DNS record name/host | 
**Value** | **string** | DNS record value | 
**Status** | **string** |  | 

## Methods

### NewDomainDnsRecord

`func NewDomainDnsRecord(type_ string, name string, value string, status string, ) *DomainDnsRecord`

NewDomainDnsRecord instantiates a new DomainDnsRecord object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDomainDnsRecordWithDefaults

`func NewDomainDnsRecordWithDefaults() *DomainDnsRecord`

NewDomainDnsRecordWithDefaults instantiates a new DomainDnsRecord object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetType

`func (o *DomainDnsRecord) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *DomainDnsRecord) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *DomainDnsRecord) SetType(v string)`

SetType sets Type field to given value.


### GetName

`func (o *DomainDnsRecord) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *DomainDnsRecord) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *DomainDnsRecord) SetName(v string)`

SetName sets Name field to given value.


### GetValue

`func (o *DomainDnsRecord) GetValue() string`

GetValue returns the Value field if non-nil, zero value otherwise.

### GetValueOk

`func (o *DomainDnsRecord) GetValueOk() (*string, bool)`

GetValueOk returns a tuple with the Value field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValue

`func (o *DomainDnsRecord) SetValue(v string)`

SetValue sets Value field to given value.


### GetStatus

`func (o *DomainDnsRecord) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *DomainDnsRecord) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *DomainDnsRecord) SetStatus(v string)`

SetStatus sets Status field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


