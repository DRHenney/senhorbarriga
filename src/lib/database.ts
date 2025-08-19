import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Configuração da conexão com o Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://[seu-usuario]:[sua-senha]@[seu-host]/[seu-banco]?sslmode=require');

export const db = drizzle(sql, { schema });

// Função para testar a conexão
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    return true;
  } catch (error) {
    return false;
  }
}
