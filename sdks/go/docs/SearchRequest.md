# SearchRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Query** | **string** | Search query string | 
**Filters** | Pointer to [**SearchRequestFilters**](SearchRequestFilters.md) |  | [optional] 
**Page** | Pointer to **int32** |  | [optional] [default to 1]
**PerPage** | Pointer to **int32** |  | [optional] [default to 20]

## Methods

### NewSearchRequest

`func NewSearchRequest(query string, ) *SearchRequest`

NewSearchRequest instantiates a new SearchRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSearchRequestWithDefaults

`func NewSearchRequestWithDefaults() *SearchRequest`

NewSearchRequestWithDefaults instantiates a new SearchRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetQuery

`func (o *SearchRequest) GetQuery() string`

GetQuery returns the Query field if non-nil, zero value otherwise.

### GetQueryOk

`func (o *SearchRequest) GetQueryOk() (*string, bool)`

GetQueryOk returns a tuple with the Query field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetQuery

`func (o *SearchRequest) SetQuery(v string)`

SetQuery sets Query field to given value.


### GetFilters

`func (o *SearchRequest) GetFilters() SearchRequestFilters`

GetFilters returns the Filters field if non-nil, zero value otherwise.

### GetFiltersOk

`func (o *SearchRequest) GetFiltersOk() (*SearchRequestFilters, bool)`

GetFiltersOk returns a tuple with the Filters field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFilters

`func (o *SearchRequest) SetFilters(v SearchRequestFilters)`

SetFilters sets Filters field to given value.

### HasFilters

`func (o *SearchRequest) HasFilters() bool`

HasFilters returns a boolean if a field has been set.

### GetPage

`func (o *SearchRequest) GetPage() int32`

GetPage returns the Page field if non-nil, zero value otherwise.

### GetPageOk

`func (o *SearchRequest) GetPageOk() (*int32, bool)`

GetPageOk returns a tuple with the Page field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPage

`func (o *SearchRequest) SetPage(v int32)`

SetPage sets Page field to given value.

### HasPage

`func (o *SearchRequest) HasPage() bool`

HasPage returns a boolean if a field has been set.

### GetPerPage

`func (o *SearchRequest) GetPerPage() int32`

GetPerPage returns the PerPage field if non-nil, zero value otherwise.

### GetPerPageOk

`func (o *SearchRequest) GetPerPageOk() (*int32, bool)`

GetPerPageOk returns a tuple with the PerPage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPerPage

`func (o *SearchRequest) SetPerPage(v int32)`

SetPerPage sets PerPage field to given value.

### HasPerPage

`func (o *SearchRequest) HasPerPage() bool`

HasPerPage returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


