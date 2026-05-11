# VerifyCustomDomainResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **string** |  | 
**DnsRecords** | [**[]DomainDnsRecord**](DomainDnsRecord.md) | DNS records that need to be configured | 

## Methods

### NewVerifyCustomDomainResponse

`func NewVerifyCustomDomainResponse(status string, dnsRecords []DomainDnsRecord, ) *VerifyCustomDomainResponse`

NewVerifyCustomDomainResponse instantiates a new VerifyCustomDomainResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewVerifyCustomDomainResponseWithDefaults

`func NewVerifyCustomDomainResponseWithDefaults() *VerifyCustomDomainResponse`

NewVerifyCustomDomainResponseWithDefaults instantiates a new VerifyCustomDomainResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *VerifyCustomDomainResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *VerifyCustomDomainResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *VerifyCustomDomainResponse) SetStatus(v string)`

SetStatus sets Status field to given value.


### GetDnsRecords

`func (o *VerifyCustomDomainResponse) GetDnsRecords() []DomainDnsRecord`

GetDnsRecords returns the DnsRecords field if non-nil, zero value otherwise.

### GetDnsRecordsOk

`func (o *VerifyCustomDomainResponse) GetDnsRecordsOk() (*[]DomainDnsRecord, bool)`

GetDnsRecordsOk returns a tuple with the DnsRecords field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDnsRecords

`func (o *VerifyCustomDomainResponse) SetDnsRecords(v []DomainDnsRecord)`

SetDnsRecords sets DnsRecords field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


