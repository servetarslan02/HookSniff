import codecs

path = "dashboard/src/messages/tr.json"

# Read raw bytes
with open(path, "rb") as f:
    raw = f.read()

# Try to detect: if file already has valid UTF-8 Turkish chars, no fix needed
# Check for İ (UTF-8: C4 B0) vs double-encoded pattern
text_utf8 = raw.decode("utf-8")

# If we see double-encoded patterns like "Ã„Â°" that means it was UTF-8 re-encoded as Latin-1 then saved as UTF-8
if "Ã„Â°" in text_utf8 or "ÃƒÂ¼" in text_utf8:
    # Double-encoded: decode UTF-8 -> encode Latin-1 -> decode UTF-8
    fixed = text_utf8.encode("latin-1").decode("utf-8")
    with open(path, "w", encoding="utf-8") as f:
        f.write(fixed)
    print("Fixed double-encoding")
elif "Ä°" in text_utf8 or "Ã¼" in text_utf8 or "ÅŸ" in text_utf8:
    # Single misread: the bytes are actually UTF-8 but displayed as Windows-1254
    # Just confirm it reads correctly
    print("File looks like valid UTF-8 with Turkish chars already")
else:
    print("File encoding looks fine, no fix needed")

# Verify
with open(path, "r", encoding="utf-8") as f:
    sample = f.read(200)
    print("First 200 chars:", sample)