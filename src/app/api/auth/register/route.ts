import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/database";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, nome e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário já existe com este email" },
        { status: 400 }
      );
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Gerar ID único para o usuário
    const userId = crypto.randomUUID();

    // Criar o usuário
    const newUser = await db.insert(users).values({
      id: userId,
      email,
      name,
      password: hashedPassword,
    }).returning();

    return NextResponse.json(
      { 
        message: "Usuário criado com sucesso!",
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
