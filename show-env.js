const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

console.log('📄 Conteúdo do arquivo .env.local:\n');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log(content);
  
  console.log('\n🔧 Para configurar:');
  console.log('1. Abra o arquivo .env.local no seu editor');
  console.log('2. Substitua a linha DATABASE_URL pela sua string de conexão do Neon');
  console.log('3. Execute: npm run db:push');
  
} else {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('Execute primeiro: node setup-env.js');
}
