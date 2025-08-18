const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Iniciando correção do deploy...');

try {
  // 1. Remover package-lock.json se existir
  if (fs.existsSync('package-lock.json')) {
    console.log('🗑️ Removendo package-lock.json antigo...');
    fs.unlinkSync('package-lock.json');
  }

  // 2. Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync('npm install', { stdio: 'inherit' });

  // 3. Git add
  console.log('📝 Adicionando arquivos ao git...');
  execSync('git add .', { stdio: 'inherit' });

  // 4. Git commit
  console.log('💾 Fazendo commit...');
  execSync('git commit -m "fix: resolve package-lock.json conflicts for Vercel"', { stdio: 'inherit' });

  // 5. Git push
  console.log('🚀 Enviando para GitHub...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('✅ Correção concluída! Aguarde o Vercel detectar as mudanças.');
} catch (error) {
  console.error('❌ Erro:', error.message);
}

