import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/database';
import { weeklyRecords, users } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Buscar registros do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Buscar usuário pelo email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    // Buscar registros do usuário ordenados por data (mais recente primeiro)
    const records = await db.query.weeklyRecords.findMany({
      where: (weeklyRecords, { eq }) => eq(weeklyRecords.userId, user.id),
      orderBy: (weeklyRecords, { desc }) => [desc(weeklyRecords.recordDate)],
    });

    return NextResponse.json({
      success: true,
      records: records.map(record => ({
        ...record,
        poolLiquidity: parseFloat(record.poolLiquidity),
        gridBot: parseFloat(record.gridBot),
        total: parseFloat(record.total),
      })),
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// POST - Criar novo registro
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const userEmail = session.user.email;

    const body = await request.json();
    const { poolLiquidity, gridBot, recordDate, notes } = body;

    if (!poolLiquidity || !gridBot || !recordDate) {
      return NextResponse.json({ 
        success: false, 
        message: 'Pool de liquidez, Grid Bot e data são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar usuário pelo email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    // Calcular total
    const total = parseFloat(poolLiquidity) + parseFloat(gridBot);

    // Calcular semana e ano
    const date = new Date(recordDate);
    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);

    // Criar registro no banco
    const newRecord = await db.insert(weeklyRecords).values({
      userId: user.id,
      poolLiquidity: parseFloat(poolLiquidity).toFixed(2),
      gridBot: parseFloat(gridBot).toFixed(2),
      total: total.toFixed(2),
      weekNumber,
      year,
      recordDate: date,
      notes: notes || null,
    }).returning();

    return NextResponse.json({
      success: true,
      record: {
        ...newRecord[0],
        poolLiquidity: parseFloat(newRecord[0].poolLiquidity),
        gridBot: parseFloat(newRecord[0].gridBot),
        total: parseFloat(newRecord[0].total),
      },
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// PUT - Atualizar registro existente
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const userEmail = session.user.email;

    const body = await request.json();
    const { id, poolLiquidity, gridBot, recordDate, notes } = body;

    if (!id || !poolLiquidity || !gridBot || !recordDate) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID, Pool de liquidez, Grid Bot e data são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar usuário pelo email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    // Verificar se o registro pertence ao usuário
    const existingRecord = await db.query.weeklyRecords.findFirst({
      where: (weeklyRecords, { and, eq }) => 
        and(eq(weeklyRecords.id, id), eq(weeklyRecords.userId, user.id)),
    });

    if (!existingRecord) {
      return NextResponse.json({ 
        success: false, 
        message: 'Registro não encontrado' 
      }, { status: 404 });
    }

    // Calcular total
    const total = parseFloat(poolLiquidity) + parseFloat(gridBot);

    // Calcular semana e ano
    const date = new Date(recordDate);
    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);

    // Atualizar registro no banco
    const updatedRecord = await db.update(weeklyRecords)
      .set({
        poolLiquidity: parseFloat(poolLiquidity).toFixed(2),
        gridBot: parseFloat(gridBot).toFixed(2),
        total: total.toFixed(2),
        weekNumber,
        year,
        recordDate: date,
        notes: notes || null,
        updatedAt: new Date(),
      })
      .where(eq(weeklyRecords.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      record: {
        ...updatedRecord[0],
        poolLiquidity: parseFloat(updatedRecord[0].poolLiquidity),
        gridBot: parseFloat(updatedRecord[0].gridBot),
        total: parseFloat(updatedRecord[0].total),
      },
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// DELETE - Remover registro
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const userEmail = session.user.email;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID do registro é obrigatório' 
      }, { status: 400 });
    }

    // Buscar usuário pelo email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    // Verificar se o registro pertence ao usuário
    const existingRecord = await db.query.weeklyRecords.findFirst({
      where: (weeklyRecords, { and, eq }) => 
        and(eq(weeklyRecords.id, parseInt(id)), eq(weeklyRecords.userId, user.id)),
    });

    if (!existingRecord) {
      return NextResponse.json({ 
        success: false, 
        message: 'Registro não encontrado' 
      }, { status: 404 });
    }

    // Remover registro
    await db.delete(weeklyRecords).where(eq(weeklyRecords.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: 'Registro removido com sucesso',
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// Função para calcular o número da semana
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
