const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Revertendo para a última versão que estava funcionando...');

try {
  // 1. Verificar o commit que estava funcionando
  console.log('🔍 Verificando commits...');
  const gitLog = execSync('git log --oneline -5', { encoding: 'utf8' });
  console.log('Últimos commits:');
  console.log(gitLog);
  
  // 2. Reverter para o commit dc79317 (que estava funcionando)
  console.log('📝 Revertendo para commit dc79317...');
  execSync('git reset --hard dc79317', { stdio: 'inherit' });
  
  // 3. Forçar push para sobrescrever o histórico
  console.log('🚀 Forçando push para GitHub...');
  execSync('git push origin main --force', { stdio: 'inherit' });
  
  console.log('✅ Revertido com sucesso! O Vercel deve fazer deploy da versão que estava funcionando.');
  console.log('💡 Agora você pode configurar as mudanças de outra forma.');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}
