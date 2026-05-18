# OpenapiClient::AuthLoginPost200Response

## Class instance methods

### `openapi_one_of`

Returns the list of classes defined in oneOf.

#### Example

```ruby
require 'openapi_client'

OpenapiClient::AuthLoginPost200Response.openapi_one_of
# =>
# [
#   :'AuthResponse',
#   :'TwoFactorRequiredResponse'
# ]
```

### build

Find the appropriate object from the `openapi_one_of` list and casts the data into it.

#### Example

```ruby
require 'openapi_client'

OpenapiClient::AuthLoginPost200Response.build(data)
# => #<AuthResponse:0x00007fdd4aab02a0>

OpenapiClient::AuthLoginPost200Response.build(data_that_doesnt_match)
# => nil
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| **data** | **Mixed** | data to be matched against the list of oneOf items |

#### Return type

- `AuthResponse`
- `TwoFactorRequiredResponse`
- `nil` (if no type matches)

