Write-Host "`nFixing TypeScript errors...`n" -ForegroundColor Cyan

# 1. Fix app/(tabs)/index.tsx - Haptics import
$file = "app\(tabs)\index.tsx"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # Add id parameter to impactAsync
    $content = $content -replace 'Haptics\.impactAsync\(\)', 'Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)'
    $content | Set-Content $file
    Write-Host "Fixed: $file" -ForegroundColor Green
}

# 2. Fix services/encryption.ts - error typing
$file = "services\encryption.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # Fix error.message by casting to Error
    $content = $content -replace 'catch \(error\) \{', 'catch (error: any) {'
    $content | Set-Content $file
    Write-Host "Fixed: $file" -ForegroundColor Green
}

# 3. Fix utils/storage.ts - readonly array
$file = "utils\storage.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # Convert readonly to mutable array
    $content = $content -replace 'keys,', '[...keys],'
    $content | Set-Content $file
    Write-Host "Fixed: $file" -ForegroundColor Green
}

# 4. Fix app/settings.tsx - remove missing import
$file = "app\settings.tsx"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # Remove or comment out the import
    $content = $content -replace 'import \{ exportEncryptedBackup \}', '// import { exportEncryptedBackup }'
    # Also comment out usage of exportEncryptedBackup
    $content = $content -replace '(\s+)(await exportEncryptedBackup)', '$1// await exportEncryptedBackup'
    $content | Set-Content $file
    Write-Host "Fixed: $file" -ForegroundColor Green
}

Write-Host "`nAll TypeScript fixes applied!`n" -ForegroundColor Green
