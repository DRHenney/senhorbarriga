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
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// POST - Criar novo token
export async function POST(request: Request) {
  try {
    console.log('🔐 Verificando autenticação...');
    const session = await getServerSession(authOptions);
    console.log('👤 Sessão:', session ? 'Autenticado' : 'Não autenticado');
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado');
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, symbol, amount, price, purchaseDate } = body;
    console.log('📥 Dados recebidos:', { name, symbol, amount, price, purchaseDate });

    if (!name || !symbol) {
      console.log('❌ Dados obrigatórios faltando');
      return NextResponse.json({ 
        success: false, 
        message: 'Nome e símbolo são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar usuário pelo email
    console.log('🔍 Buscando usuário:', session.user.email);
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, session.user!.email!),
    });

    if (!user) {
      console.log('❌ Usuário não encontrado no banco');
      return NextResponse.json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    console.log('✅ Usuário encontrado:', user.id);

    // Usar valores padrão se não fornecidos
    const tokenAmount = amount ? parseFloat(amount) : 0;
    const tokenPrice = price ? parseFloat(price) : 0;
    const tokenValue = tokenAmount * tokenPrice;

    console.log('💰 Valores calculados:', { tokenAmount, tokenPrice, tokenValue });

    // Criar token no banco
    const newToken = await db.insert(userTokens).values({
      userId: user.id,
      name,
      symbol: symbol.toUpperCase(),
      amount: tokenAmount.toString(),
      price: tokenPrice.toString(),
      value: tokenValue.toString(),
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(), // Usar data fornecida ou data atual
    }).returning();

    console.log('✅ Token criado:', newToken);

    return NextResponse.json({ 
      success: true, 
      token: newToken,
      message: 'Token criado com sucesso!' 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro na API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor'
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
        amount: parseFloat(amount).toString(),
        price: parseFloat(price).toString(),
        value: parseFloat(value).toString(),
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
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// DELETE - Remover token
export async function DELETE(request: Request) {
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
        message: 'ID do token é obrigatório' 
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

    // Verificar se o token pertence ao usuário
    const token = await db.select().from(userTokens).where(eq(userTokens.id, parseInt(id))).limit(1);
    
    if (token.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token não encontrado' 
      }, { status: 404 });
    }

    if (token[0].userId !== user.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token não pertence ao usuário' 
      }, { status: 403 });
    }

    // Remover token do banco
    await db.delete(userTokens).where(eq(userTokens.id, parseInt(id)));

    return NextResponse.json({ 
      success: true, 
      message: 'Token removido com sucesso!' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
