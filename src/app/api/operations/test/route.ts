import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { activeOperations } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Teste POST /api/operations/test');
    
    // Teste 1: Verificar sessão
    const session = await getServerSession(authOptions);
    console.log('👤 Sessão:', {
      exists: !!session,
      email: session?.user?.email,
      id: session?.user?.id
    });
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        message: 'Usuário não autenticado',
        test: 'session_failed'
      }, { status: 401 });
    }
    
    // Teste 2: Verificar dados recebidos
    const body = await request.json();
    console.log('📦 Dados recebidos:', body);
    
    // Teste 3: Tentar inserção com dados fixos
    const testData = {
      userId: session.user.id,
      type: 'pool',
      pair: 'TEST/USD',
      capital: '100.00',
      startDate: new Date(),
      notes: 'Teste de inserção',
    };
    
    console.log('💾 Tentando inserir:', testData);
    
    const [newOperation] = await db
      .insert(activeOperations)
      .values(testData)
      .returning();
    
    console.log('✅ Inserção bem-sucedida:', newOperation);
    
    // Teste 4: Remover a operação de teste
    await db
      .delete(activeOperations)
      .where(eq(activeOperations.id, newOperation.id));
    
    console.log('✅ Remoção bem-sucedida');
    
    return NextResponse.json({
      success: true,
      message: 'Todos os testes passaram',
      data: {
        session: 'OK',
        database: 'OK',
        insert: 'OK',
        delete: 'OK'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro no teste',
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}
