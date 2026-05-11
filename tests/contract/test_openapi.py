import schemathesis
from schemathesis.checks import not_a_server_error

schema = schemathesis.from_url("http://localhost:3000/api-docs/openapi.json")


@schema.parametrize()
def test_api_conforms_to_spec(case):
    """Verify every API endpoint conforms to its OpenAPI spec.

    For each operation defined in the schema, schemathesis will:
    1. Generate valid and edge-case request payloads
    2. Send the request to the server
    3. Validate the response status code, headers, and body against the spec

    Run with:  pytest tests/contract/test_openapi.py --base-url http://localhost:3000
    """
    response = case.call()
    case.validate_response(response)


@schema.parametrize()
def test_no_server_errors(case):
    """Ensure no endpoint returns a 5xx server error for spec-conformant input."""
    response = case.call()
    not_a_server_error(response)
