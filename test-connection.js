import { testConnection } from './src/lib/database.js';

console.log('🔍 Testando conexão com o banco Neon...\n');

testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Conexão com banco Neon estabelecida com sucesso!');
      console.log('📊 Todos os dados serão salvos no banco Neon PostgreSQL.');
      console.log('👥 Quando você se registrar, os dados serão salvos na tabela "users"');
      console.log('🔐 Quando fizer login, as sessões serão salvas na tabela "sessions"');
      console.log('🌐 Login com Google salvará dados na tabela "accounts"');
    } else {
      console.log('❌ Erro na conexão com o banco');
    }
  })
  .catch(error => {
    console.error('❌ Erro:', error.message);
  });
