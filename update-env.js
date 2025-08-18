const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

// String de conexão real do Neon
const realDatabaseUrl = 'postgresql://neondb_owner:npg_fPoiDKLI4TZ8@ep-spring-term-adcnmist-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('🔧 Atualizando arquivo .env.local com a string de conexão real...\n');

if (fs.existsSync(envPath)) {
  // Ler o conteúdo atual
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Substituir a linha DATABASE_URL
  const oldUrl = /DATABASE_URL="[^"]*"/;
  const newUrl = `DATABASE_URL="${realDatabaseUrl}"`;
  
  if (oldUrl.test(content)) {
    content = content.replace(oldUrl, newUrl);
    
    // Salvar o arquivo atualizado
    fs.writeFileSync(envPath, content);
    
    console.log('✅ Arquivo .env.local atualizado com sucesso!');
    console.log('   🔗 String de conexão do Neon configurada\n');
    
    console.log('📄 Conteúdo atualizado:');
    console.log(content);
    
    console.log('\n🚀 Agora você pode executar:');
    console.log('   npm run db:push');
    
  } else {
    console.log('❌ Não foi possível encontrar a linha DATABASE_URL no arquivo');
  }
  
} else {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('Execute primeiro: node setup-env.js');
}
