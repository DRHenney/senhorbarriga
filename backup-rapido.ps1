# Script de Backup Rápido - Senhor Barriga
# Execute este script para backup automático sem perguntas

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupTag = "backup-$timestamp"

Write-Host "🏷️  Criando backup: $backupTag" -ForegroundColor Cyan

# Criar tag e enviar para GitHub
git tag $backupTag
git push origin --tags

Write-Host "✅ Backup criado: $backupTag" -ForegroundColor Green
