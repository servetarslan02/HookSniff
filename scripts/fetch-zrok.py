import json, urllib.request, ssl
ctx = ssl.create_default_context()
url = "https://api.github.com/repos/openziti/zrok/releases/latest"
req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})
data = json.loads(urllib.request.urlopen(req, context=ctx).read())
for a in data["assets"]:
    if "windows_amd64" in a["name"] and "sha" not in a["name"]:
        print(a["browser_download_url"])