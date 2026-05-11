# UpgradeRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Plan** | **string** |  | 
**Provider** | Pointer to **string** |  | [optional] 

## Methods

### NewUpgradeRequest

`func NewUpgradeRequest(plan string, ) *UpgradeRequest`

NewUpgradeRequest instantiates a new UpgradeRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpgradeRequestWithDefaults

`func NewUpgradeRequestWithDefaults() *UpgradeRequest`

NewUpgradeRequestWithDefaults instantiates a new UpgradeRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPlan

`func (o *UpgradeRequest) GetPlan() string`

GetPlan returns the Plan field if non-nil, zero value otherwise.

### GetPlanOk

`func (o *UpgradeRequest) GetPlanOk() (*string, bool)`

GetPlanOk returns a tuple with the Plan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlan

`func (o *UpgradeRequest) SetPlan(v string)`

SetPlan sets Plan field to given value.


### GetProvider

`func (o *UpgradeRequest) GetProvider() string`

GetProvider returns the Provider field if non-nil, zero value otherwise.

### GetProviderOk

`func (o *UpgradeRequest) GetProviderOk() (*string, bool)`

GetProviderOk returns a tuple with the Provider field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProvider

`func (o *UpgradeRequest) SetProvider(v string)`

SetProvider sets Provider field to given value.

### HasProvider

`func (o *UpgradeRequest) HasProvider() bool`

HasProvider returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


