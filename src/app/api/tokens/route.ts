import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { userTokens } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET - Buscar tokens do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    // Buscar usuário pelo email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user!.email!),
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    // Buscar tokens do usuário
    const tokens = await db.select().from(userTokens).where(eq(userTokens.userId, user.id));

    return NextResponse.json({ 
      success: true, 
      tokens 
    });
  } catch (error) {
    console.error('Erro ao buscar tokens:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// POST - Criar novo token
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, symbol, amount, price } = body;

    if (!name || !symbol || !amount || !price) {
      return NextResponse.json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar usuário pelo email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user!.email!),
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    // Criar token no banco
    const newToken = await db.insert(userTokens).values({
      userId: user.id,
      name,
      symbol: symbol.toUpperCase(),
      amount: parseFloat(amount).toFixed(2),
      price: parseFloat(price).toFixed(2),
      value: (parseFloat(amount) * parseFloat(price)).toFixed(2),
    }).returning();

    return NextResponse.json({ 
      success: true, 
      token: newToken,
      message: 'Token criado com sucesso!' 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar token:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// PUT - Atualizar token existente
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, amount, price, value } = body;

    if (!id || amount === undefined || price === undefined || value === undefined) {
      return NextResponse.json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar usuário pelo email
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user!.email!),
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    // Atualizar token no banco
    const updatedToken = await db.update(userTokens)
      .set({
        amount: parseFloat(amount).toFixed(2),
        price: parseFloat(price).toFixed(2),
        value: parseFloat(value).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(userTokens.id, id))
      .returning();

    return NextResponse.json({ 
      success: true, 
      token: updatedToken[0],
      message: 'Token atualizado com sucesso!' 
    });
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
