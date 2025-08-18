const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    
    // Testar conexão
    const result = await sql`SELECT NOW()`;
    console.log('✅ Conexão OK:', result[0]);
    
    // Verificar tabelas
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📋 Tabelas encontradas:', tables.map(t => t.table_name));
    
    // Criar usuário de teste
    const testUserId = crypto.randomUUID();
    const testUser = await sql`
      INSERT INTO users (id, email, name, password)
      VALUES (${testUserId}, 'teste@exemplo.com', 'Usuário Teste', 'senha123')
      RETURNING id, email, name
    `;
    console.log('👤 Usuário de teste criado:', testUser[0]);
    
    // Verificar usuário
    const user = await sql`
      SELECT * FROM users WHERE email = 'teste@exemplo.com'
    `;
    console.log('✅ Usuário encontrado:', user[0]);
    
    // Limpar usuário de teste
    await sql`DELETE FROM users WHERE email = 'teste@exemplo.com'`;
    console.log('🧹 Usuário de teste removido');
    
    console.log('🎉 Banco de dados funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testDatabase();
