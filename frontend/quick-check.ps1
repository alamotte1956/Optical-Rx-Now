# Quick Pre-Build Checklist for Windows/PowerShell
# Run with: .\quick-check.ps1

Write-Host "`n🎯 Quick Pre-Build Checklist`n" -ForegroundColor Cyan

$checks = @(
    @{Name="TypeScript compilation"; Command="npx tsc --noEmit"},
    @{Name="Linting"; Command="npm run lint"},
    @{Name="Icon exists"; Command="Test-Path assets\images\icon.png"},
    @{Name="Adaptive icon exists"; Command="Test-Path assets\images\adaptive-icon.png"},
    @{Name="Splash exists"; Command="Test-Path assets\images\splash-image.png"},
    @{Name="app.json valid"; Command="Get-Content app.json | ConvertFrom-Json | Out-Null"}
)

$passed = 0
$failed = 0

foreach ($check in $checks) {
    Write-Host "$($check.Name)... " -NoNewline
    try {
        if ($check.Command -like "Test-Path*") {
            $result = Invoke-Expression $check.Command
            if ($result) {
                Write-Host "✅" -ForegroundColor Green
                $passed++
            } else {
                Write-Host "❌" -ForegroundColor Red
                $failed++
            }
        } else {
            Invoke-Expression "$($check.Command) 2>&1 | Out-Null"
            if ($LASTEXITCODE -eq 0 -or $?) {
                Write-Host "✅" -ForegroundColor Green
                $passed++
            } else {
                Write-Host "❌" -ForegroundColor Red
                $failed++
            }
        }
    } catch {
        Write-Host "❌" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n📊 Results: $passed passed, $failed failed`n" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "🚀 Ready to build!`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Please fix errors before building`n" -ForegroundColor Yellow
}