// Script para automatizar commit e push
const { execSync } = require('child_process');

function autoPush(message = 'feat: atualização automática') {
  try {
    console.log('🤖 Iniciando push automático...');
    
    // Verificar se há mudanças
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      console.log('✅ Nenhuma mudança detectada');
      return;
    }
    
    console.log('📝 Mudanças detectadas, fazendo commit...');
    
    // Adicionar todas as mudanças
    execSync('git add .', { stdio: 'inherit' });
    
    // Fazer commit
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    
    console.log('🚀 Fazendo push...');
    
    // Fazer push
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✅ Push automático concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no push automático:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const message = process.argv[2] || 'feat: atualização automática';
  autoPush(message);
}

module.exports = { autoPush };
