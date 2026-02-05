# Asset Size Checker for Windows/PowerShell
# Run with: .\check-assets.ps1

Write-Host "`n📊 Asset Size Report`n" -ForegroundColor Cyan

if (Test-Path "assets") {
    # Individual file sizes
    Write-Host "Individual Assets:" -ForegroundColor Yellow
    Get-ChildItem -Path assets -Recurse -File | 
        Select-Object Name, @{N='Size(KB)';E={[math]::Round($_.Length/1KB,2)}}, @{N='Path';E={$_.FullName.Replace($PWD,'.') -replace '\','/'}} | 
        Sort-Object 'Size(KB)' -Descending | 
        Format-Table -AutoSize

    # Summary
    $totalSize = Get-ChildItem -Path assets -Recurse -File | 
        Measure-Object -Property Length -Sum
    
    $totalMB = [math]::Round($totalSize.Sum / 1MB, 2)
    
    Write-Host "`nSummary:" -ForegroundColor Yellow
    Write-Host "  Total files: $($totalSize.Count)"
    Write-Host "  Total size: $totalMB MB"
    
    # Recommendations
    if ($totalMB -gt 50) {
        Write-Host "`n⚠️  Warning: Asset size is large ($totalMB MB)" -ForegroundColor Yellow
        Write-Host "  Consider compressing images or using smaller versions" -ForegroundColor Yellow
    } else {
        Write-Host "`n✅ Asset size looks good ($totalMB MB)" -ForegroundColor Green
    }
    
    # Find large files (> 1MB)
    $largeFiles = Get-ChildItem -Path assets -Recurse -File | 
        Where-Object { $_.Length -gt 1MB }
    
    if ($largeFiles) {
        Write-Host "`n🔍 Large files (>1MB):" -ForegroundColor Yellow
        $largeFiles | 
            Select-Object Name, @{N='Size(MB)';E={[math]::Round($_.Length/1MB,2)}} | 
            Format-Table -AutoSize
    }
} else {
    Write-Host "❌ Assets folder not found!" -ForegroundColor Red
}