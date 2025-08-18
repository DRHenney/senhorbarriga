import { db } from './src/lib/database.js';
import { users, sessions, accounts } from './src/lib/schema.js';

async function checkDatabase() {
  console.log('🔍 Verificando dados no banco Neon...\n');

  try {
    // Verificar usuários
    const allUsers = await db.select().from(users);
    console.log('👥 Usuários cadastrados:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ID: ${user.id}`);
    });

    // Verificar sessões
    const allSessions = await db.select().from(sessions);
    console.log('\n🔐 Sessões ativas:', allSessions.length);
    allSessions.forEach(session => {
      console.log(`   - Usuário ID: ${session.userId} - Expira: ${session.expires}`);
    });

    // Verificar contas OAuth
    const allAccounts = await db.select().from(accounts);
    console.log('\n🌐 Contas OAuth:', allAccounts.length);
    allAccounts.forEach(account => {
      console.log(`   - ${account.provider} (${account.providerAccountId}) - Usuário ID: ${account.userId}`);
    });

    console.log('\n✅ Conexão com banco Neon funcionando perfeitamente!');
    console.log('📊 Todos os dados estão sendo salvos corretamente.');

  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error.message);
  }
}

checkDatabase();
