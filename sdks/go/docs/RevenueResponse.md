# RevenueResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**MonthlyRevenue** | [**[]RevenueResponseMonthlyRevenueInner**](RevenueResponseMonthlyRevenueInner.md) |  | 
**RevenueByPlan** | [**[]RevenueResponseRevenueByPlanInner**](RevenueResponseRevenueByPlanInner.md) |  | 
**Mrr** | **float64** |  | 
**ChurnRate** | **float64** |  | 
**MrrTrend** | **float64** |  | 

## Methods

### NewRevenueResponse

`func NewRevenueResponse(monthlyRevenue []RevenueResponseMonthlyRevenueInner, revenueByPlan []RevenueResponseRevenueByPlanInner, mrr float64, churnRate float64, mrrTrend float64, ) *RevenueResponse`

NewRevenueResponse instantiates a new RevenueResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewRevenueResponseWithDefaults

`func NewRevenueResponseWithDefaults() *RevenueResponse`

NewRevenueResponseWithDefaults instantiates a new RevenueResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMonthlyRevenue

`func (o *RevenueResponse) GetMonthlyRevenue() []RevenueResponseMonthlyRevenueInner`

GetMonthlyRevenue returns the MonthlyRevenue field if non-nil, zero value otherwise.

### GetMonthlyRevenueOk

`func (o *RevenueResponse) GetMonthlyRevenueOk() (*[]RevenueResponseMonthlyRevenueInner, bool)`

GetMonthlyRevenueOk returns a tuple with the MonthlyRevenue field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMonthlyRevenue

`func (o *RevenueResponse) SetMonthlyRevenue(v []RevenueResponseMonthlyRevenueInner)`

SetMonthlyRevenue sets MonthlyRevenue field to given value.


### GetRevenueByPlan

`func (o *RevenueResponse) GetRevenueByPlan() []RevenueResponseRevenueByPlanInner`

GetRevenueByPlan returns the RevenueByPlan field if non-nil, zero value otherwise.

### GetRevenueByPlanOk

`func (o *RevenueResponse) GetRevenueByPlanOk() (*[]RevenueResponseRevenueByPlanInner, bool)`

GetRevenueByPlanOk returns a tuple with the RevenueByPlan field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRevenueByPlan

`func (o *RevenueResponse) SetRevenueByPlan(v []RevenueResponseRevenueByPlanInner)`

SetRevenueByPlan sets RevenueByPlan field to given value.


### GetMrr

`func (o *RevenueResponse) GetMrr() float64`

GetMrr returns the Mrr field if non-nil, zero value otherwise.

### GetMrrOk

`func (o *RevenueResponse) GetMrrOk() (*float64, bool)`

GetMrrOk returns a tuple with the Mrr field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMrr

`func (o *RevenueResponse) SetMrr(v float64)`

SetMrr sets Mrr field to given value.


### GetChurnRate

`func (o *RevenueResponse) GetChurnRate() float64`

GetChurnRate returns the ChurnRate field if non-nil, zero value otherwise.

### GetChurnRateOk

`func (o *RevenueResponse) GetChurnRateOk() (*float64, bool)`

GetChurnRateOk returns a tuple with the ChurnRate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChurnRate

`func (o *RevenueResponse) SetChurnRate(v float64)`

SetChurnRate sets ChurnRate field to given value.


### GetMrrTrend

`func (o *RevenueResponse) GetMrrTrend() float64`

GetMrrTrend returns the MrrTrend field if non-nil, zero value otherwise.

### GetMrrTrendOk

`func (o *RevenueResponse) GetMrrTrendOk() (*float64, bool)`

GetMrrTrendOk returns a tuple with the MrrTrend field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMrrTrend

`func (o *RevenueResponse) SetMrrTrend(v float64)`

SetMrrTrend sets MrrTrend field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


