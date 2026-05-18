# PlaygroundTestResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**StatusCode** | **int32** | HTTP status code returned by the endpoint | 
**ResponseBody** | **string** | Raw response body from the endpoint | 
**LatencyMs** | **int32** |  | 
**Headers** | Pointer to **map[string]interface{}** | Response headers from the endpoint | [optional] 

## Methods

### NewPlaygroundTestResponse

`func NewPlaygroundTestResponse(statusCode int32, responseBody string, latencyMs int32, ) *PlaygroundTestResponse`

NewPlaygroundTestResponse instantiates a new PlaygroundTestResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewPlaygroundTestResponseWithDefaults

`func NewPlaygroundTestResponseWithDefaults() *PlaygroundTestResponse`

NewPlaygroundTestResponseWithDefaults instantiates a new PlaygroundTestResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatusCode

`func (o *PlaygroundTestResponse) GetStatusCode() int32`

GetStatusCode returns the StatusCode field if non-nil, zero value otherwise.

### GetStatusCodeOk

`func (o *PlaygroundTestResponse) GetStatusCodeOk() (*int32, bool)`

GetStatusCodeOk returns a tuple with the StatusCode field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatusCode

`func (o *PlaygroundTestResponse) SetStatusCode(v int32)`

SetStatusCode sets StatusCode field to given value.


### GetResponseBody

`func (o *PlaygroundTestResponse) GetResponseBody() string`

GetResponseBody returns the ResponseBody field if non-nil, zero value otherwise.

### GetResponseBodyOk

`func (o *PlaygroundTestResponse) GetResponseBodyOk() (*string, bool)`

GetResponseBodyOk returns a tuple with the ResponseBody field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetResponseBody

`func (o *PlaygroundTestResponse) SetResponseBody(v string)`

SetResponseBody sets ResponseBody field to given value.


### GetLatencyMs

`func (o *PlaygroundTestResponse) GetLatencyMs() int32`

GetLatencyMs returns the LatencyMs field if non-nil, zero value otherwise.

### GetLatencyMsOk

`func (o *PlaygroundTestResponse) GetLatencyMsOk() (*int32, bool)`

GetLatencyMsOk returns a tuple with the LatencyMs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLatencyMs

`func (o *PlaygroundTestResponse) SetLatencyMs(v int32)`

SetLatencyMs sets LatencyMs field to given value.


### GetHeaders

`func (o *PlaygroundTestResponse) GetHeaders() map[string]interface{}`

GetHeaders returns the Headers field if non-nil, zero value otherwise.

### GetHeadersOk

`func (o *PlaygroundTestResponse) GetHeadersOk() (*map[string]interface{}, bool)`

GetHeadersOk returns a tuple with the Headers field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHeaders

`func (o *PlaygroundTestResponse) SetHeaders(v map[string]interface{})`

SetHeaders sets Headers field to given value.

### HasHeaders

`func (o *PlaygroundTestResponse) HasHeaders() bool`

HasHeaders returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


