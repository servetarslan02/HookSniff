# Contract Testing — HookSniff API

Automatically verifies that the running HookSniff API conforms to its OpenAPI specification.

## Prerequisites

1. **Running API** — the HookSniff API must be accessible at `http://localhost:3000`:
   ```bash
   make local          # or: docker compose up -d --build
   ```
2. **Python 3.10+** with `pip`.

## Setup

```bash
cd tests/contract
pip install -r requirements.txt
```

## Run

```bash
# From the project root:
pytest tests/contract/test_openapi.py --base-url http://localhost:3000 -v

# With more iterations (stress test):
pytest tests/contract/test_openapi.py --base-url http://localhost:3000 -v --hypothesis-max-examples=200
```

## What It Tests

| Check | Description |
|-------|-------------|
| `validate_response` | Status code, headers, and response body match the OpenAPI schema |
| `not_a_server_error` | No 5xx errors for spec-valid inputs |

## CI Integration

Add to your CI pipeline (after the API starts):

```yaml
- name: Contract tests
  run: |
    pip install -r tests/contract/requirements.txt
    pytest tests/contract/test_openapi.py --base-url http://localhost:3000 -v
```
