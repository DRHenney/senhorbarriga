import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { activeOperations } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

// GET - Buscar operações ativas do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user.email!),
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const operations = await db.select().from(activeOperations).where(
      and(
        eq(activeOperations.userId, user.id),
        eq(activeOperations.isActive, true)
      )
    );

    return NextResponse.json(operations);
  } catch (error) {
    console.error('Erro ao buscar operações ativas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova operação ativa
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user.email!),
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { type, pair, capital, startDate, rangeMin, rangeMax, numGrids, notes } = body;

    // Validações
    if (!type || !pair || !capital || !startDate) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    if (type !== 'pool' && type !== 'grid') {
      return NextResponse.json({ error: 'Tipo de operação inválido' }, { status: 400 });
    }

    const capitalValue = parseFloat(capital);
    if (isNaN(capitalValue) || capitalValue <= 0) {
      return NextResponse.json({ error: 'Capital inválido' }, { status: 400 });
    }

    // Validações específicas para grid bots
    if (type === 'grid') {
      if (!rangeMin || !rangeMax || !numGrids) {
        return NextResponse.json({ error: 'Grid bots precisam de range mínimo, máximo e número de grids' }, { status: 400 });
      }

      const minValue = parseFloat(rangeMin);
      const maxValue = parseFloat(rangeMax);
      const gridsValue = parseInt(numGrids);

      if (isNaN(minValue) || isNaN(maxValue) || isNaN(gridsValue) || 
          minValue <= 0 || maxValue <= 0 || gridsValue <= 0) {
        return NextResponse.json({ error: 'Valores de grid inválidos' }, { status: 400 });
      }

      if (minValue >= maxValue) {
        return NextResponse.json({ error: 'Range mínimo deve ser menor que o máximo' }, { status: 400 });
      }
    }

    const newOperation = await db.insert(activeOperations).values({
      userId: user.id,
      type,
      pair: pair.toUpperCase(),
      capital: capitalValue,
      startDate: new Date(startDate),
      rangeMin: rangeMin ? parseFloat(rangeMin) : null,
      rangeMax: rangeMax ? parseFloat(rangeMax) : null,
      numGrids: numGrids ? parseInt(numGrids) : null,
      notes: notes || null,
    }).returning();

    return NextResponse.json(newOperation[0]);
  } catch (error) {
    console.error('Erro ao criar operação ativa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar operação ativa
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user.email!),
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { id, type, pair, capital, startDate, rangeMin, rangeMax, numGrids, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da operação não fornecido' }, { status: 400 });
    }

    // Verificar se a operação pertence ao usuário
    const existingOperation = await db.select().from(activeOperations).where(
      and(
        eq(activeOperations.id, id),
        eq(activeOperations.userId, user.id)
      )
    ).limit(1);

    if (existingOperation.length === 0) {
      return NextResponse.json({ error: 'Operação não encontrada' }, { status: 404 });
    }

    // Validações
    if (!type || !pair || !capital || !startDate) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    if (type !== 'pool' && type !== 'grid') {
      return NextResponse.json({ error: 'Tipo de operação inválido' }, { status: 400 });
    }

    const capitalValue = parseFloat(capital);
    if (isNaN(capitalValue) || capitalValue <= 0) {
      return NextResponse.json({ error: 'Capital inválido' }, { status: 400 });
    }

    // Validações específicas para grid bots
    if (type === 'grid') {
      if (!rangeMin || !rangeMax || !numGrids) {
        return NextResponse.json({ error: 'Grid bots precisam de range mínimo, máximo e número de grids' }, { status: 400 });
      }

      const minValue = parseFloat(rangeMin);
      const maxValue = parseFloat(rangeMax);
      const gridsValue = parseInt(numGrids);

      if (isNaN(minValue) || isNaN(maxValue) || isNaN(gridsValue) || 
          minValue <= 0 || maxValue <= 0 || gridsValue <= 0) {
        return NextResponse.json({ error: 'Valores de grid inválidos' }, { status: 400 });
      }

      if (minValue >= maxValue) {
        return NextResponse.json({ error: 'Range mínimo deve ser menor que o máximo' }, { status: 400 });
      }
    }

    const updatedOperation = await db.update(activeOperations)
      .set({
        type,
        pair: pair.toUpperCase(),
        capital: capitalValue,
        startDate: new Date(startDate),
        rangeMin: rangeMin ? parseFloat(rangeMin) : null,
        rangeMax: rangeMax ? parseFloat(rangeMax) : null,
        numGrids: numGrids ? parseInt(numGrids) : null,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(activeOperations.id, id))
      .returning();

    return NextResponse.json(updatedOperation[0]);
  } catch (error) {
    console.error('Erro ao atualizar operação ativa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover operação ativa (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user.email!),
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da operação não fornecido' }, { status: 400 });
    }

    // Verificar se a operação pertence ao usuário
    const existingOperation = await db.select().from(activeOperations).where(
      and(
        eq(activeOperations.id, parseInt(id)),
        eq(activeOperations.userId, user.id)
      )
    ).limit(1);

    if (existingOperation.length === 0) {
      return NextResponse.json({ error: 'Operação não encontrada' }, { status: 404 });
    }

    // Soft delete - marcar como inativa
    await db.update(activeOperations)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(activeOperations.id, parseInt(id)));

    return NextResponse.json({ message: 'Operação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover operação ativa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
