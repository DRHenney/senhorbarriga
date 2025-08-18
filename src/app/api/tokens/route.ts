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
      where: (users, { eq }) => eq(users.email, session.user.email!),
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
      where: (users, { eq }) => eq(users.email, session.user.email!),
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
      amount: amount.toString(),
      price: price.toString(),
      value: (parseFloat(amount) * parseFloat(price)).toString(),
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
