import { NextRequest, NextResponse } from 'next/server';

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

    // Simular sucesso sem inserir no banco
    const mockOperation = {
      id: Math.floor(Math.random() * 1000),
      userId: 'test-user-123',
      type,
      pair: pair.toUpperCase(),
      capital: capital.toString(),
      startDate: new Date(startDate).toISOString(),
      rangeMin: rangeMin ? rangeMin.toString() : null,
      rangeMax: rangeMax ? rangeMax.toString() : null,
      numGrids: numGrids ? parseInt(numGrids) : null,
      notes: notes || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('✅ Operação simulada com sucesso:', mockOperation);

    return NextResponse.json({
      success: true,
      operation: mockOperation,
      message: 'Operação simulada (sem inserção no banco)'
    });

  } catch (error) {
    console.error('❌ Erro ao processar operação:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
