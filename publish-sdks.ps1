# ============================================
# HookSniff SDK Publisher (Windows PowerShell)
# Kullanım: .\publish-sdks.ps1
# ============================================

Write-Host "🪝 HookSniff SDK Publisher" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# npm
function Publish-Npm {
    Write-Host "[1/7] Node.js (npm)..." -ForegroundColor Yellow
    Set-Location sdks\node
    npm install 2>$null
    if (!(Test-Path src)) { New-Item -ItemType Directory -Path src | Out-Null }
    if (Test-Path api.ts) { Move-Item api.ts src\ -Force }
    if (Test-Path model) { Move-Item model src\ -Force }
    if (Test-Path api) { Move-Item api src\ -Force }
    Set-Content -Path src\index.ts -Value 'export * from "./api/apis"; export * from "./model/models";'
    npm run build 2>$null
    npm publish --access public 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  ✅ npm yayinda" -ForegroundColor Green } else { Write-Host "  ❌ npm hata" -ForegroundColor Red }
    Set-Location ..\..
}

# PyPI
function Publish-Pypi {
    Write-Host "[2/7] Python (PyPI)..." -ForegroundColor Yellow
    Set-Location sdks\python
    python -m build 2>$null
    python -m twine upload dist\* 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  ✅ PyPI yayinda" -ForegroundColor Green } else { Write-Host "  ❌ PyPI hata" -ForegroundColor Red }
    Set-Location ..\..
}

# RubyGems
function Publish-Ruby {
    Write-Host "[3/7] Ruby (RubyGems)..." -ForegroundColor Yellow
    Set-Location sdks\ruby
    gem build hooksniff.gemspec 2>$null
    gem push hooksniff-*.gem 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  ✅ RubyGems yayinda" -ForegroundColor Green } else { Write-Host "  ❌ RubyGems hata" -ForegroundColor Red }
    Set-Location ..\..
}

# NuGet
function Publish-NuGet {
    Write-Host "[4/7] C# (NuGet)..." -ForegroundColor Yellow
    Set-Location sdks\csharp\src\hooksniff
    dotnet restore 2>$null
    dotnet pack -c Release -o .\nupkg 2>$null
    $nupkg = Get-ChildItem -Path .\nupkg -Filter *.nupkg | Select-Object -First 1
    if ($nupkg) {
        dotnet nuget push $nupkg.FullName --source https://api.nuget.org/v3/index.json --api-key $env:NUGET_API_KEY 2>$null
        if ($LASTEXITCODE -eq 0) { Write-Host "  ✅ NuGet yayinda" -ForegroundColor Green } else { Write-Host "  ❌ NuGet hata - API key gerekli" -ForegroundColor Red }
    } else {
        Write-Host "  ❌ NuGet paket olusturulamadi" -ForegroundColor Red
    }
    Set-Location ..\..\..\..
}

# Hex (Elixir)
function Publish-Hex {
    Write-Host "[5/7] Elixir (Hex)..." -ForegroundColor Yellow
    Set-Location sdks\elixir
    mix hex.publish --yes 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  ✅ Hex yayinda" -ForegroundColor Green } else { Write-Host "  ❌ Hex hata" -ForegroundColor Red }
    Set-Location ..\..
}

# Go (git tag)
function Publish-Go {
    Write-Host "[6/7] Go (git tag)..." -ForegroundColor Yellow
    Set-Location sdks\go
    git tag v0.3.0 2>$null
    git push origin v0.3.0 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  ✅ Go tag atildi" -ForegroundColor Green } else { Write-Host "  ⚠️ Go tag zaten var" -ForegroundColor Yellow }
    Set-Location ..\..
}

# Swift (git tag)
function Publish-Swift {
    Write-Host "[7/7] Swift (git tag)..." -ForegroundColor Yellow
    Set-Location sdks\swift
    git tag v0.3.0 2>$null
    git push origin v0.3.0 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "  ✅ Swift tag atildi" -ForegroundColor Green } else { Write-Host "  ⚠️ Swift tag zaten var" -ForegroundColor Yellow }
    Set-Location ..\..
}

Write-Host "Hangi SDK'lari publish etmek istiyorsun?"
Write-Host "  1) Hepsini"
Write-Host "  2) Tek tek sec"
Write-Host ""
$choice = Read-Host "Secim (1/2)"

if ($choice -eq "1") {
    Publish-Npm
    Publish-Pypi
    Publish-Ruby
    Publish-NuGet
    Publish-Hex
    Publish-Go
    Publish-Swift
    Write-Host ""
    Write-Host "⚠️ Java, Kotlin, PHP → Manuel gerekli (AI yapacak)" -ForegroundColor Yellow
    Write-Host "✅ Rust → Zaten crates.io'da" -ForegroundColor Green
} else {
    Write-Host "Hangisi? (npm/pypi/ruby/nuget/hex/go/swift)"
    $sdk = Read-Host "SDK adi"
    switch ($sdk) {
        "npm"    { Publish-Npm }
        "pypi"   { Publish-Pypi }
        "ruby"   { Publish-Ruby }
        "nuget"  { Publish-NuGet }
        "hex"    { Publish-Hex }
        "go"     { Publish-Go }
        "swift"  { Publish-Swift }
        default  { Write-Host "Bilinmeyen SDK" -ForegroundColor Red }
    }
}

Write-Host ""
Write-Host "🎉 Bitti!" -ForegroundColor Cyan
