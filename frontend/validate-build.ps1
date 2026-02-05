# Pre-Build Validation Script for Windows/PowerShell
# Run with: .\validate-build.ps1

Write-Host "`n🚀 Pre-Build Final Validation for Optical Rx Now" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$ErrorCount = 0

# 1. Check Node/NPM versions
Write-Host "📦 Checking environment..." -ForegroundColor Yellow
Write-Host "Node version: $(node --version)"
Write-Host "NPM version: $(npm --version)"
Write-Host "Expo CLI: " -NoNewline
npx expo --version

# 2. Run TypeScript check
Write-Host "`n📘 Running TypeScript compilation check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript errors found!" -ForegroundColor Red
    $ErrorCount++
} else {
    Write-Host "✅ TypeScript check passed" -ForegroundColor Green
}

# 3. Run linter
Write-Host "`n🔍 Running linter..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting errors found!" -ForegroundColor Red
    $ErrorCount++
} else {
    Write-Host "✅ Linting passed" -ForegroundColor Green
}

# 4. Verify required assets exist
Write-Host "`n🖼️  Verifying critical assets..." -ForegroundColor Yellow
$requiredAssets = @(
    "assets\images\icon.png",
    "assets\images\adaptive-icon.png",
    "assets\images\splash-image.png",
    "assets\images\favicon.png"
)

foreach ($asset in $requiredAssets) {
    if (Test-Path $asset) {
        $size = [math]::Round((Get-Item $asset).Length / 1KB, 2)
        Write-Host "  ✅ $asset ($size KB)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MISSING: $asset" -ForegroundColor Red
        $ErrorCount++
    }
}

# 5. Check app.json validity
Write-Host "`n⚙️  Validating app.json..." -ForegroundColor Yellow
try {
    $appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
    Write-Host "  ✅ app.json is valid JSON" -ForegroundColor Green
    Write-Host "  📱 App Name: $($appJson.expo.name)"
    Write-Host "  📦 Version: $($appJson.expo.version)"
    Write-Host "  🍎 iOS Bundle: $($appJson.expo.ios.bundleIdentifier)"
    Write-Host "  🤖 Android Package: $($appJson.expo.android.package)"
} catch {
    Write-Host "  ❌ app.json is invalid!" -ForegroundColor Red
    $ErrorCount++
}

# 6. Check package.json validity
Write-Host "`n📋 Validating package.json..." -ForegroundColor Yellow
try {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    Write-Host "  ✅ package.json is valid JSON" -ForegroundColor Green
    Write-Host "  📦 Package: $($packageJson.name) v$($packageJson.version)"
} catch {
    Write-Host "  ❌ package.json is invalid!" -ForegroundColor Red
    $ErrorCount++
}

# 7. Check for common issues
Write-Host "`n🔍 Scanning for potential issues..." -ForegroundColor Yellow

# Check for console.log in app directory
$consoleLogs = Get-ChildItem -Path app -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx -ErrorAction SilentlyContinue | 
    Select-String -Pattern "console\.log" | 
    Measure-Object

if ($consoleLogs.Count -gt 0) {
    Write-Host "  ⚠️  Found $($consoleLogs.Count) console.log statements" -ForegroundColor Yellow
}

# 8. Check total asset size
Write-Host "`n📊 Asset size summary..." -ForegroundColor Yellow
if (Test-Path "assets") {
    $totalSize = Get-ChildItem -Path assets -Recurse -File | 
        Measure-Object -Property Length -Sum
    
    $totalMB = [math]::Round($totalSize.Sum / 1MB, 2)
    Write-Host "  Total assets: $($totalSize.Count) files, $totalMB MB" -ForegroundColor Cyan
    
    if ($totalMB -gt 50) {
        Write-Host "  ⚠️  Assets are large. Consider optimization." -ForegroundColor Yellow
    }
}

# 9. Check dependencies for vulnerabilities
Write-Host "`n🔒 Security audit..." -ForegroundColor Yellow
npm audit --production 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ No vulnerabilities found" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Check npm audit output for details" -ForegroundColor Yellow
}

# 10. Expo diagnostics
Write-Host "`n🏥 Running Expo diagnostics..." -ForegroundColor Yellow
npx expo-doctor

# Summary
Write-Host "`n================================================" -ForegroundColor Cyan
if ($ErrorCount -eq 0) {
    Write-Host "✅ All validations passed! Ready to build." -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Found $ErrorCount critical errors. Please fix before building." -ForegroundColor Red
    exit 1
}