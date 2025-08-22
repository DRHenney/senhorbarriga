import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { activeOperations } from '@/lib/schema';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando POST /api/operations/simple');
    
    const body = await request.json();
    console.log('📦 Dados recebidos:', body);
    
    const { type, pair, capital, startDate, rangeMin, rangeMax, numGrids, notes } = body;

    // Validações básicas
    if (!type || !pair || !capital || !startDate) {
      return NextResponse.json({ 
        success: false, 
        message: 'Campos obrigatórios: type, pair, capital, startDate',
        received: { type, pair, capital, startDate }
      }, { status: 400 });
    }

    // Inserir operação no banco com ID fixo para teste
    const testData = {
      userId: 'test-user-123', // ID fixo para teste
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

    console.log('✅ Operação criada com sucesso:', newOperation);

    return NextResponse.json({
      success: true,
      operation: newOperation
    });

  } catch (error) {
    console.error('❌ Erro ao criar operação:', error);
    console.error('📋 Detalhes do erro:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message
    }, { status: 500 });
  }
}
