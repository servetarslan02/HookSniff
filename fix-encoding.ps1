$path = "dashboard/src/messages/tr.json"
$bytes = [System.IO.File]::ReadAllBytes($path)
$text = [System.Text.Encoding]::GetEncoding(1254).GetString($bytes)
[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Fixed encoding: $path"