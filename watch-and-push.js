// Script para monitorar mudanças e fazer push automático
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

let isProcessing = false;
let timeoutId = null;

function autoPush(message = 'feat: atualização automática') {
  if (isProcessing) {
    console.log('⏳ Push já em andamento, aguardando...');
    return;
  }

  try {
    isProcessing = true;
    console.log('🤖 Iniciando push automático...');
    
    // Verificar se há mudanças
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
      console.log('✅ Nenhuma mudança detectada');
      isProcessing = false;
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
  } finally {
    isProcessing = false;
  }
}

function debouncedAutoPush() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  
  timeoutId = setTimeout(() => {
    autoPush();
  }, 2000); // Aguarda 2 segundos após a última mudança
}

function watchFiles() {
  console.log('👀 Monitorando mudanças nos arquivos...');
  console.log('💡 O push será feito automaticamente após 2 segundos de inatividade');
  console.log('🛑 Pressione Ctrl+C para parar');
  
  // Monitorar diretório src
  const srcPath = path.join(__dirname, 'src');
  
  fs.watch(srcPath, { recursive: true }, (eventType, filename) => {
    if (filename && !filename.includes('node_modules') && !filename.includes('.git')) {
      console.log(`📁 Mudança detectada: ${filename}`);
      debouncedAutoPush();
    }
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'watch') {
    watchFiles();
  } else {
    const message = process.argv[2] || 'feat: atualização automática';
    autoPush(message);
  }
}

module.exports = { autoPush, watchFiles };
