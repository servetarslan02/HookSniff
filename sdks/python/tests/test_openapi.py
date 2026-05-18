import requests

def test_openapi_json_is_available(hooksniff_server_url: str) -> None:
    r = requests.get(f"{hooksniff_server_url}/api/v1/openapi.json")
    assert r.status_code == 200
    assert r.headers["content-type"] == 'application/json'
