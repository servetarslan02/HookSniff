# DeliveryTrendResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Range** | Pointer to **string** |  | [optional] 
**Buckets** | Pointer to [**[]DeliveryTrendResponseBucketsInner**](DeliveryTrendResponseBucketsInner.md) |  | [optional] 

## Methods

### NewDeliveryTrendResponse

`func NewDeliveryTrendResponse() *DeliveryTrendResponse`

NewDeliveryTrendResponse instantiates a new DeliveryTrendResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeliveryTrendResponseWithDefaults

`func NewDeliveryTrendResponseWithDefaults() *DeliveryTrendResponse`

NewDeliveryTrendResponseWithDefaults instantiates a new DeliveryTrendResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetRange

`func (o *DeliveryTrendResponse) GetRange() string`

GetRange returns the Range field if non-nil, zero value otherwise.

### GetRangeOk

`func (o *DeliveryTrendResponse) GetRangeOk() (*string, bool)`

GetRangeOk returns a tuple with the Range field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRange

`func (o *DeliveryTrendResponse) SetRange(v string)`

SetRange sets Range field to given value.

### HasRange

`func (o *DeliveryTrendResponse) HasRange() bool`

HasRange returns a boolean if a field has been set.

### GetBuckets

`func (o *DeliveryTrendResponse) GetBuckets() []DeliveryTrendResponseBucketsInner`

GetBuckets returns the Buckets field if non-nil, zero value otherwise.

### GetBucketsOk

`func (o *DeliveryTrendResponse) GetBucketsOk() (*[]DeliveryTrendResponseBucketsInner, bool)`

GetBucketsOk returns a tuple with the Buckets field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBuckets

`func (o *DeliveryTrendResponse) SetBuckets(v []DeliveryTrendResponseBucketsInner)`

SetBuckets sets Buckets field to given value.

### HasBuckets

`func (o *DeliveryTrendResponse) HasBuckets() bool`

HasBuckets returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


