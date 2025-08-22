import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { activeOperations } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('🐛 Debug POST /api/operations/debug');
    
    const body = await request.json();
    console.log('📦 Dados recebidos:', body);
    
    // Validar dados obrigatórios
    const { type, pair, capital, startDate, rangeMin, rangeMax, numGrids, notes } = body;
    
    if (!type || !pair || !capital || !startDate) {
      return NextResponse.json({
        success: false,
        message: 'Campos obrigatórios: type, pair, capital, startDate',
        received: { type, pair, capital, startDate }
      }, { status: 400 });
    }
    
    // Tentar inserção com dados de teste
    const testData = {
      userId: 'debug-user-id', // ID fixo para teste
      type,
      pair: pair.toUpperCase(),
      capital: capital.toString(),
      startDate: new Date(startDate),
      rangeMin: rangeMin ? rangeMin.toString() : null,
      rangeMax: rangeMax ? rangeMax.toString() : null,
      numGrids: numGrids ? parseInt(numGrids) : null,
      notes: notes || null,
    };
    
    console.log('💾 Tentando inserir:', testData);
    
    const [newOperation] = await db
      .insert(activeOperations)
      .values(testData)
      .returning();
    
    console.log('✅ Inserção bem-sucedida:', newOperation);
    
    // Remover a operação de teste
    await db
      .delete(activeOperations)
      .where(eq(activeOperations.id, newOperation.id));
    
    console.log('✅ Remoção bem-sucedida');
    
    return NextResponse.json({
      success: true,
      message: 'Teste de inserção bem-sucedido',
      data: {
        received: body,
        processed: testData,
        inserted: newOperation,
        deleted: true
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro no teste de debug',
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}
