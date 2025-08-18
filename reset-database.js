const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function resetDatabase() {
  try {
    console.log('🔄 Resetando banco de dados...');
    
    // Drop todas as tabelas existentes
    await sql`DROP TABLE IF EXISTS price_history CASCADE`;
    await sql`DROP TABLE IF EXISTS defi_positions CASCADE`;
    await sql`DROP TABLE IF EXISTS transactions CASCADE`;
    await sql`DROP TABLE IF EXISTS wallets CASCADE`;
    await sql`DROP TABLE IF EXISTS verification_tokens CASCADE`;
    await sql`DROP TABLE IF EXISTS sessions CASCADE`;
    await sql`DROP TABLE IF EXISTS accounts CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    
    console.log('✅ Tabelas removidas com sucesso');
    console.log('🎯 Agora execute: npm run db:push');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error);
  }
}

resetDatabase();
