import urllib.request, ssl, tarfile, os

ctx = ssl.create_default_context()
url = "https://github.com/openziti/zrok/releases/download/v2.0.4/zrok_2.0.4_windows_amd64.tar.gz"
tar_path = "zrok.tar.gz"
extract_dir = "zrok-bin"

os.makedirs(extract_dir, exist_ok=True)

print("Downloading zrok...")
req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})
data = urllib.request.urlopen(req, context=ctx).read()
with open(tar_path, "wb") as f:
    f.write(data)

print("Extracting...")
with tarfile.open(tar_path) as tar:
    tar.extractall(extract_dir)

os.remove(tar_path)
print("Done! zrok installed at: " + os.path.abspath(extract_dir))
print("Contents:")
for f in os.listdir(extract_dir):
    print("  " + f)