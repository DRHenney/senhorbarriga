const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Configurando variáveis de ambiente...\n');

// Gerar NEXTAUTH_SECRET
const generateSecret = () => {
  return crypto.randomBytes(32).toString('base64');
};

// Template do arquivo .env.local
const envTemplate = `# Configuração do banco de dados Neon
# ⚠️ IMPORTANTE: Substitua pela sua string de conexão real do Neon
DATABASE_URL="postgresql://[seu-usuario]:[sua-senha]@[seu-host]/[seu-banco]?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="${generateSecret()}"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional - configure se quiser usar login com Google)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
`;

const envPath = path.join(__dirname, '.env.local');

try {
  // Verificar se o arquivo já existe
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env.local já existe!');
    console.log('   Se quiser sobrescrever, delete o arquivo e execute novamente.\n');
  } else {
    // Criar o arquivo .env.local
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Arquivo .env.local criado com sucesso!');
    console.log('   📍 Localização:', envPath);
    console.log('   🔑 NEXTAUTH_SECRET gerado automaticamente\n');
  }

  console.log('📋 Próximos passos:');
  console.log('1. Abra o arquivo .env.local');
  console.log('2. Substitua DATABASE_URL pela sua string de conexão do Neon');
  console.log('3. Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET (opcional)');
  console.log('4. Execute: npm run db:push\n');

  console.log('🔗 Para obter a string de conexão do Neon:');
  console.log('   https://console.neon.tech/app/projects/lucky-poetry-11420099?branchId=br-autumn-leaf-adgix16m');
  console.log('   → Clique em "Connection Details"');
  console.log('   → Copie a string de conexão\n');

} catch (error) {
  console.error('❌ Erro ao criar arquivo .env.local:', error.message);
  console.log('\n📝 Crie manualmente o arquivo .env.local com o seguinte conteúdo:');
  console.log(envTemplate);
}
