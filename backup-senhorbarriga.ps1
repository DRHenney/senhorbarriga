# Backup Senhor Barriga - Comando Rápido
# Execute: .\backup-senhorbarriga.ps1

# Navegar para o diretório do projeto
Set-Location "senhorbarriga"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupTag = "backup-$timestamp"

Write-Host "🏷️  Criando backup Senhor Barriga: $backupTag" -ForegroundColor Cyan

# Criar tag e enviar para GitHub
git tag $backupTag
git push origin --tags

Write-Host "✅ Backup criado: $backupTag" -ForegroundColor Green
Write-Host "💡 Para restaurar: git checkout $backupTag" -ForegroundColor Gray
