# Backup Rápido - Senhor Barriga
# Execute: .\backup.ps1

Set-Location "senhorbarriga"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupTag = "backup-$timestamp"

Write-Host "🏷️  Backup: $backupTag" -ForegroundColor Cyan

git tag $backupTag
git push origin --tags

Write-Host "✅ Pronto!" -ForegroundColor Green
