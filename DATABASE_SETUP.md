# Configuração do Banco de Dados Neon

Este projeto está configurado para usar o banco de dados Neon (PostgreSQL serverless) com Drizzle ORM.

## 📋 Pré-requisitos

1. Conta no Neon: https://console.neon.tech/
2. Projeto criado no Neon
3. String de conexão do banco de dados

## 🔧 Configuração

### 1. Obter a String de Conexão

1. Acesse o console do Neon: https://console.neon.tech/app/projects/lucky-poetry-11420099?branchId=br-autumn-leaf-adgix16m
2. Copie a string de conexão do seu projeto
3. Crie um arquivo `.env.local` na raiz do projeto com:

```env
DATABASE_URL="postgresql://[seu-usuario]:[sua-senha]@[seu-host]/[seu-banco]?sslmode=require"
```

### 2. Gerar e Executar Migrações

```bash
# Gerar migrações baseadas no schema
npm run db:generate

# Executar migrações no banco de dados
npm run db:migrate

# Ou fazer push direto (para desenvolvimento)
npm run db:push
```

### 3. Testar a Conexão

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000/api/test-db`

## 📊 Estrutura do Banco

O schema inclui as seguintes tabelas:

- **users**: Usuários do sistema
- **wallets**: Carteiras dos usuários
- **transactions**: Histórico de transações
- **defiPositions**: Posições em protocolos DeFi
- **priceHistory**: Histórico de preços de tokens

## 🛠️ Scripts Disponíveis

- `npm run db:generate` - Gera arquivos de migração
- `npm run db:migrate` - Executa migrações
- `npm run db:push` - Faz push direto do schema
- `npm run db:studio` - Abre o Drizzle Studio para visualizar dados

## 🔌 API Routes

### Testar Conexão
- `GET /api/test-db` - Testa a conexão com o banco

### Usuários
- `GET /api/users` - Lista todos os usuários
- `POST /api/users` - Cria novo usuário

## 📝 Exemplo de Uso

```typescript
import { db } from '@/lib/database';
import { users } from '@/lib/schema';

// Buscar todos os usuários
const allUsers = await db.select().from(users);

// Criar novo usuário
const newUser = await db.insert(users).values({
  email: 'usuario@exemplo.com',
  name: 'Nome do Usuário',
  password: 'senha123'
}).returning();
```

## 🔒 Segurança

⚠️ **Importante**: Em produção, sempre:
- Use variáveis de ambiente para credenciais
- Criptografe senhas antes de salvar
- Implemente autenticação adequada
- Use HTTPS para todas as conexões

## 🚀 Próximos Passos

1. Configure a string de conexão no `.env.local`
2. Execute as migrações
3. Teste a conexão via API
4. Comece a desenvolver suas funcionalidades!

## 📞 Suporte

Para dúvidas sobre o Neon: https://neon.tech/docs
Para dúvidas sobre Drizzle: https://orm.drizzle.team/docs
