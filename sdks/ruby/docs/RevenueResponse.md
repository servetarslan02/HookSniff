# OpenapiClient::RevenueResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **monthly_revenue** | [**Array&lt;RevenueResponseMonthlyRevenueInner&gt;**](RevenueResponseMonthlyRevenueInner.md) |  |  |
| **revenue_by_plan** | [**Array&lt;RevenueResponseRevenueByPlanInner&gt;**](RevenueResponseRevenueByPlanInner.md) |  |  |
| **mrr** | **Float** |  |  |
| **churn_rate** | **Float** |  |  |
| **mrr_trend** | **Float** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::RevenueResponse.new(
  monthly_revenue: null,
  revenue_by_plan: null,
  mrr: null,
  churn_rate: null,
  mrr_trend: null
)
```

