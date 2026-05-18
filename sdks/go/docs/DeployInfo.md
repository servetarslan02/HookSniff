# DeployInfo

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Version** | Pointer to **string** | Semantic version from Cargo.toml | [optional] 
**GitCommit** | Pointer to **NullableString** | Git SHA of the deployed commit | [optional] 
**BuildTime** | Pointer to **NullableString** | ISO 8601 build timestamp | [optional] 
**Environment** | Pointer to **string** | Deployment environment (production, staging, etc.) | [optional] 

## Methods

### NewDeployInfo

`func NewDeployInfo() *DeployInfo`

NewDeployInfo instantiates a new DeployInfo object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDeployInfoWithDefaults

`func NewDeployInfoWithDefaults() *DeployInfo`

NewDeployInfoWithDefaults instantiates a new DeployInfo object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetVersion

`func (o *DeployInfo) GetVersion() string`

GetVersion returns the Version field if non-nil, zero value otherwise.

### GetVersionOk

`func (o *DeployInfo) GetVersionOk() (*string, bool)`

GetVersionOk returns a tuple with the Version field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetVersion

`func (o *DeployInfo) SetVersion(v string)`

SetVersion sets Version field to given value.

### HasVersion

`func (o *DeployInfo) HasVersion() bool`

HasVersion returns a boolean if a field has been set.

### GetGitCommit

`func (o *DeployInfo) GetGitCommit() string`

GetGitCommit returns the GitCommit field if non-nil, zero value otherwise.

### GetGitCommitOk

`func (o *DeployInfo) GetGitCommitOk() (*string, bool)`

GetGitCommitOk returns a tuple with the GitCommit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetGitCommit

`func (o *DeployInfo) SetGitCommit(v string)`

SetGitCommit sets GitCommit field to given value.

### HasGitCommit

`func (o *DeployInfo) HasGitCommit() bool`

HasGitCommit returns a boolean if a field has been set.

### SetGitCommitNil

`func (o *DeployInfo) SetGitCommitNil(b bool)`

 SetGitCommitNil sets the value for GitCommit to be an explicit nil

### UnsetGitCommit
`func (o *DeployInfo) UnsetGitCommit()`

UnsetGitCommit ensures that no value is present for GitCommit, not even an explicit nil
### GetBuildTime

`func (o *DeployInfo) GetBuildTime() string`

GetBuildTime returns the BuildTime field if non-nil, zero value otherwise.

### GetBuildTimeOk

`func (o *DeployInfo) GetBuildTimeOk() (*string, bool)`

GetBuildTimeOk returns a tuple with the BuildTime field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBuildTime

`func (o *DeployInfo) SetBuildTime(v string)`

SetBuildTime sets BuildTime field to given value.

### HasBuildTime

`func (o *DeployInfo) HasBuildTime() bool`

HasBuildTime returns a boolean if a field has been set.

### SetBuildTimeNil

`func (o *DeployInfo) SetBuildTimeNil(b bool)`

 SetBuildTimeNil sets the value for BuildTime to be an explicit nil

### UnsetBuildTime
`func (o *DeployInfo) UnsetBuildTime()`

UnsetBuildTime ensures that no value is present for BuildTime, not even an explicit nil
### GetEnvironment

`func (o *DeployInfo) GetEnvironment() string`

GetEnvironment returns the Environment field if non-nil, zero value otherwise.

### GetEnvironmentOk

`func (o *DeployInfo) GetEnvironmentOk() (*string, bool)`

GetEnvironmentOk returns a tuple with the Environment field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnvironment

`func (o *DeployInfo) SetEnvironment(v string)`

SetEnvironment sets Environment field to given value.

### HasEnvironment

`func (o *DeployInfo) HasEnvironment() bool`

HasEnvironment returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


