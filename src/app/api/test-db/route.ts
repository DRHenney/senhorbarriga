import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { activeOperations } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando conexão com banco de dados...');
    
    // Testar conexão básica
    const result = await db.execute('SELECT NOW() as current_time');
    console.log('✅ Conexão OK:', result);
    
    // Verificar estrutura da tabela activeOperations
    const tableInfo = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'active_operations'
      ORDER BY ordinal_position
    `);
    console.log('📋 Estrutura da tabela active_operations:', tableInfo);
    
    // Tentar inserir uma operação de teste
    const testOperation = await db
      .insert(activeOperations)
      .values({
        userId: 'test-user-id',
        type: 'pool',
        pair: 'TEST/USD',
        capital: '100.00',
        startDate: new Date(),
        notes: 'Teste de inserção',
      })
      .returning();
    
    console.log('✅ Inserção de teste OK:', testOperation);
    
    // Remover a operação de teste
    await db
      .delete(activeOperations)
      .where(eq(activeOperations.id, testOperation[0].id));
    
    console.log('✅ Remoção de teste OK');
    
    return NextResponse.json({
      success: true,
      message: 'Teste de banco de dados realizado com sucesso',
      data: {
        connection: 'OK',
        tableStructure: tableInfo,
        testInsert: 'OK',
        testDelete: 'OK'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de banco:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro no teste de banco de dados',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
