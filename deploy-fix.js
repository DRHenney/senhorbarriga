const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Corrigindo problemas de deploy...');

try {
  // 1. Commit das mudanças
  console.log('📝 Fazendo commit...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix: corrigir problemas de deploy - remover console.log - simplificar configurações"', { stdio: 'inherit' });
  
  // 2. Push para GitHub
  console.log('🚀 Enviando para GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });
  
  console.log('✅ Correções enviadas! Aguarde o Vercel detectar as mudanças.');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}
