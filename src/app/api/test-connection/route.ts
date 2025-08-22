import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    console.log('🧪 Testando conexão com banco de dados...');
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'Não configurada');
    
    // Testar conexão básica
    const result = await db.execute('SELECT NOW() as current_time');
    console.log('✅ Conexão OK:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com banco de dados estabelecida com sucesso!',
      data: {
        connection: 'OK',
        timestamp: result[0]?.current_time
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    return NextResponse.json({
      success: false,
      message: 'Falha ao conectar com o banco de dados',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
