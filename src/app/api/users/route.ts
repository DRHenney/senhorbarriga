import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users } from '@/lib/schema';


// GET - Listar todos os usuários
export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json({ 
      success: true, 
      users: allUsers 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao buscar usuários',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// POST - Criar novo usuário
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email, nome e senha são obrigatórios' 
      }, { status: 400 });
    }

    const newUser = await db.insert(users).values({
      id: crypto.randomUUID(),
      email,
      name,
      password, // Em produção, deve ser criptografada
    }).returning();

    return NextResponse.json({ 
      success: true, 
      user: newUser[0],
      message: 'Usuário criado com sucesso!' 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao criar usuário',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
