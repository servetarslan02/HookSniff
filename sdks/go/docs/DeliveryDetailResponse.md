# DeliveryDetailResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Delivery** | [**Delivery**](Delivery.md) |  | 
**Attempts** | [**[]DeliveryAttempt**](DeliveryAttempt.md) |  | 
**Endpoint** | Pointer to [**Endpoint**](Endpoint.md) |  | [optional] 
**RequestHeaders** | Pointer to **map[string]interface{}** | Original request headers sent with the delivery | [optional] 
**RequestBody** | Pointer to **map[string]interface{}** | Original request body sent with the delivery | [optional] 
**ResponseHeaders** | Pointer to **map[string]interface{}** | Response headers received from the endpoint | [optional] 

## Methods

### NewDeliveryDetailResponse

`func NewDeliveryDetailResponse(delivery Delivery, attempts []DeliveryAttempt, ) *DeliveryDetailResponse`

NewDeliveryDetailResponse instantiates a new DeliveryDetailResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeliveryDetailResponseWithDefaults

`func NewDeliveryDetailResponseWithDefaults() *DeliveryDetailResponse`

NewDeliveryDetailResponseWithDefaults instantiates a new DeliveryDetailResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDelivery

`func (o *DeliveryDetailResponse) GetDelivery() Delivery`

GetDelivery returns the Delivery field if non-nil, zero value otherwise.

### GetDeliveryOk

`func (o *DeliveryDetailResponse) GetDeliveryOk() (*Delivery, bool)`

GetDeliveryOk returns a tuple with the Delivery field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDelivery

`func (o *DeliveryDetailResponse) SetDelivery(v Delivery)`

SetDelivery sets Delivery field to given value.


### GetAttempts

`func (o *DeliveryDetailResponse) GetAttempts() []DeliveryAttempt`

GetAttempts returns the Attempts field if non-nil, zero value otherwise.

### GetAttemptsOk

`func (o *DeliveryDetailResponse) GetAttemptsOk() (*[]DeliveryAttempt, bool)`

GetAttemptsOk returns a tuple with the Attempts field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAttempts

`func (o *DeliveryDetailResponse) SetAttempts(v []DeliveryAttempt)`

SetAttempts sets Attempts field to given value.


### GetEndpoint

`func (o *DeliveryDetailResponse) GetEndpoint() Endpoint`

GetEndpoint returns the Endpoint field if non-nil, zero value otherwise.

### GetEndpointOk

`func (o *DeliveryDetailResponse) GetEndpointOk() (*Endpoint, bool)`

GetEndpointOk returns a tuple with the Endpoint field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEndpoint

`func (o *DeliveryDetailResponse) SetEndpoint(v Endpoint)`

SetEndpoint sets Endpoint field to given value.

### HasEndpoint

`func (o *DeliveryDetailResponse) HasEndpoint() bool`

HasEndpoint returns a boolean if a field has been set.

### GetRequestHeaders

`func (o *DeliveryDetailResponse) GetRequestHeaders() map[string]interface{}`

GetRequestHeaders returns the RequestHeaders field if non-nil, zero value otherwise.

### GetRequestHeadersOk

`func (o *DeliveryDetailResponse) GetRequestHeadersOk() (*map[string]interface{}, bool)`

GetRequestHeadersOk returns a tuple with the RequestHeaders field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRequestHeaders

`func (o *DeliveryDetailResponse) SetRequestHeaders(v map[string]interface{})`

SetRequestHeaders sets RequestHeaders field to given value.

### HasRequestHeaders

`func (o *DeliveryDetailResponse) HasRequestHeaders() bool`

HasRequestHeaders returns a boolean if a field has been set.

### SetRequestHeadersNil

`func (o *DeliveryDetailResponse) SetRequestHeadersNil(b bool)`

 SetRequestHeadersNil sets the value for RequestHeaders to be an explicit nil

### UnsetRequestHeaders
`func (o *DeliveryDetailResponse) UnsetRequestHeaders()`

UnsetRequestHeaders ensures that no value is present for RequestHeaders, not even an explicit nil
### GetRequestBody

`func (o *DeliveryDetailResponse) GetRequestBody() map[string]interface{}`

GetRequestBody returns the RequestBody field if non-nil, zero value otherwise.

### GetRequestBodyOk

`func (o *DeliveryDetailResponse) GetRequestBodyOk() (*map[string]interface{}, bool)`

GetRequestBodyOk returns a tuple with the RequestBody field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRequestBody

`func (o *DeliveryDetailResponse) SetRequestBody(v map[string]interface{})`

SetRequestBody sets RequestBody field to given value.

### HasRequestBody

`func (o *DeliveryDetailResponse) HasRequestBody() bool`

HasRequestBody returns a boolean if a field has been set.

### SetRequestBodyNil

`func (o *DeliveryDetailResponse) SetRequestBodyNil(b bool)`

 SetRequestBodyNil sets the value for RequestBody to be an explicit nil

### UnsetRequestBody
`func (o *DeliveryDetailResponse) UnsetRequestBody()`

UnsetRequestBody ensures that no value is present for RequestBody, not even an explicit nil
### GetResponseHeaders

`func (o *DeliveryDetailResponse) GetResponseHeaders() map[string]interface{}`

GetResponseHeaders returns the ResponseHeaders field if non-nil, zero value otherwise.

### GetResponseHeadersOk

`func (o *DeliveryDetailResponse) GetResponseHeadersOk() (*map[string]interface{}, bool)`

GetResponseHeadersOk returns a tuple with the ResponseHeaders field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResponseHeaders

`func (o *DeliveryDetailResponse) SetResponseHeaders(v map[string]interface{})`

SetResponseHeaders sets ResponseHeaders field to given value.

### HasResponseHeaders

`func (o *DeliveryDetailResponse) HasResponseHeaders() bool`

HasResponseHeaders returns a boolean if a field has been set.

### SetResponseHeadersNil

`func (o *DeliveryDetailResponse) SetResponseHeadersNil(b bool)`

 SetResponseHeadersNil sets the value for ResponseHeaders to be an explicit nil

### UnsetResponseHeaders
`func (o *DeliveryDetailResponse) UnsetResponseHeaders()`

UnsetResponseHeaders ensures that no value is present for ResponseHeaders, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


