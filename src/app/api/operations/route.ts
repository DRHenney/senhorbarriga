import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { activeOperations } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// GET - Buscar operações do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    console.log('🔍 Buscando operações para usuário:', session.user.email);

    // Buscar operações ativas do usuário
    const operations = await db
      .select()
      .from(activeOperations)
      .where(
        and(
          eq(activeOperations.userId, session.user.id),
          eq(activeOperations.isActive, true)
        )
      )
      .orderBy(activeOperations.createdAt);

    console.log('✅ Operações encontradas:', operations.length);

    return NextResponse.json({
      success: true,
      operations: operations
    });

  } catch (error) {
    console.error('❌ Erro ao buscar operações:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// POST - Criar nova operação
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando POST /api/operations');
    
    const session = await getServerSession(authOptions);
    console.log('👤 Sessão encontrada:', !!session);
    console.log('📧 Email do usuário:', session?.user?.email);
    console.log('🆔 ID do usuário:', session?.user?.id);
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { type, pair, capital, startDate, rangeMin, rangeMax, numGrids, notes } = body;

    console.log('➕ Criando nova operação:', { type, pair, capital, startDate });

    // Validações
    if (!type || !pair || !capital || !startDate) {
      return NextResponse.json({ 
        success: false, 
        message: 'Campos obrigatórios: type, pair, capital, startDate' 
      }, { status: 400 });
    }

    if (type !== 'pool' && type !== 'grid') {
      return NextResponse.json({ 
        success: false, 
        message: 'Tipo deve ser "pool" ou "grid"' 
      }, { status: 400 });
    }

    // Validações específicas para grid bots
    if (type === 'grid') {
      if (!rangeMin || !rangeMax || !numGrids) {
        return NextResponse.json({ 
          success: false, 
          message: 'Para grid bots, rangeMin, rangeMax e numGrids são obrigatórios' 
        }, { status: 400 });
      }

      if (parseFloat(rangeMin) >= parseFloat(rangeMax)) {
        return NextResponse.json({ 
          success: false, 
          message: 'Range mínimo deve ser menor que o máximo' 
        }, { status: 400 });
      }
    }

    // Inserir operação no banco
    console.log('💾 Inserindo operação no banco de dados...');
    console.log('📊 Dados para inserção:', {
      userId: session.user.id,
      type,
      pair: pair.toUpperCase(),
      capital: capital.toString(),
      startDate: new Date(startDate),
      rangeMin: rangeMin ? rangeMin.toString() : null,
      rangeMax: rangeMax ? rangeMax.toString() : null,
      numGrids: numGrids ? parseInt(numGrids) : null,
      notes: notes || null,
    });
    
    const [newOperation] = await db
      .insert(activeOperations)
      .values({
        userId: session.user.id,
        type,
        pair: pair.toUpperCase(),
        capital: capital.toString(),
        startDate: new Date(startDate),
        rangeMin: rangeMin ? rangeMin.toString() : null,
        rangeMax: rangeMax ? rangeMax.toString() : null,
        numGrids: numGrids ? parseInt(numGrids) : null,
        notes: notes || null,
      })
      .returning();

    console.log('✅ Operação criada com sucesso:', newOperation.id);

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
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// PUT - Atualizar operação
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, type, pair, capital, startDate, rangeMin, rangeMax, numGrids, notes } = body;

    console.log('✏️ Atualizando operação:', id);

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID da operação é obrigatório' 
      }, { status: 400 });
    }

    // Verificar se a operação pertence ao usuário
    const existingOperation = await db
      .select()
      .from(activeOperations)
      .where(
        and(
          eq(activeOperations.id, id),
          eq(activeOperations.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingOperation.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Operação não encontrada' 
      }, { status: 404 });
    }

    // Atualizar operação
    const [updatedOperation] = await db
      .update(activeOperations)
      .set({
        type: type || existingOperation[0].type,
        pair: pair ? pair.toUpperCase() : existingOperation[0].pair,
        capital: capital ? capital.toString() : existingOperation[0].capital,
        startDate: startDate ? new Date(startDate) : existingOperation[0].startDate,
        rangeMin: rangeMin ? rangeMin.toString() : existingOperation[0].rangeMin,
        rangeMax: rangeMax ? rangeMax.toString() : existingOperation[0].rangeMax,
        numGrids: numGrids ? parseInt(numGrids) : existingOperation[0].numGrids,
        notes: notes !== undefined ? notes : existingOperation[0].notes,
        updatedAt: new Date(),
      })
      .where(eq(activeOperations.id, id))
      .returning();

    console.log('✅ Operação atualizada com sucesso');

    return NextResponse.json({
      success: true,
      operation: updatedOperation
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar operação:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// DELETE - Remover operação
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID da operação é obrigatório' 
      }, { status: 400 });
    }

    console.log('🗑️ Removendo operação:', id);

    // Verificar se a operação pertence ao usuário
    const existingOperation = await db
      .select()
      .from(activeOperations)
      .where(
        and(
          eq(activeOperations.id, parseInt(id)),
          eq(activeOperations.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingOperation.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Operação não encontrada' 
      }, { status: 404 });
    }

    // Marcar como inativa (soft delete)
    await db
      .update(activeOperations)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(activeOperations.id, parseInt(id)));

    console.log('✅ Operação removida com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Operação removida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover operação:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}
