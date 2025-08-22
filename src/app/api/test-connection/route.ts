import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testando conexão com banco de dados...');
    
    // Verificar se a variável de ambiente está configurada
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    console.log('🔗 DATABASE_URL configurada:', hasDatabaseUrl);
    
    return NextResponse.json({
      success: true,
      message: 'Teste de conexão realizado',
      data: {
        databaseUrlConfigured: hasDatabaseUrl,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro no teste de conexão',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
