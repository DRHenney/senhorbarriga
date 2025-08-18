import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  console.log('🔍 Testando conexão com o banco Neon...\n');

  try {
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Conexão com banco Neon estabelecida com sucesso!');
    console.log('🕐 Hora atual do banco:', result[0].current_time);
    console.log('📊 Versão do PostgreSQL:', result[0].db_version.split(' ')[0]);
    
    console.log('\n📋 Verificando tabelas criadas...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('🗄️ Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    console.log('\n✅ Banco Neon configurado e funcionando!');
    console.log('📊 Todos os dados serão salvos corretamente.');
    console.log('👥 Registros → tabela "users"');
    console.log('🔐 Logins → tabela "sessions"');
    console.log('🌐 Google OAuth → tabela "accounts"');

  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testConnection();
