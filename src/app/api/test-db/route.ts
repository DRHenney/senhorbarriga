import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json({ 
        success: true, 
        message: 'Conexão com o banco de dados estabelecida com sucesso!' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Falha ao conectar com o banco de dados' 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
