# Configuração da Autenticação

Este projeto está configurado com NextAuth.js para autenticação por email/senha e Google OAuth.

## 📋 Pré-requisitos

1. Conta no Google Cloud Console
2. Projeto configurado no Google Cloud
3. Credenciais OAuth 2.0 configuradas

## 🔧 Configuração

### 1. Configurar Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ 
4. Vá para "Credenciais" > "Criar credenciais" > "ID do cliente OAuth 2.0"
5. Configure as URLs autorizadas:
   - **Origem JavaScript autorizada**: `http://localhost:3000`
   - **URI de redirecionamento autorizado**: `http://localhost:3000/api/auth/callback/google`

### 2. Configurar Variáveis de Ambiente

Crie ou atualize o arquivo `.env.local` com as seguintes variáveis:

```env
# Banco de dados
DATABASE_URL="postgresql://[seu-usuario]:[sua-senha]@[seu-host]/[seu-banco]?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

### 3. Gerar NEXTAUTH_SECRET

Execute o comando para gerar uma chave secreta:

```bash
openssl rand -base64 32
```

Ou use um gerador online de chaves secretas.

### 4. Executar Migrações

```bash
# Gerar migrações com as novas tabelas de autenticação
npm run db:generate

# Executar migrações
npm run db:push
```

## 🚀 Funcionalidades

### Autenticação por Email/Senha
- Registro de novos usuários
- Login com email e senha
- Senhas criptografadas com bcrypt
- Validação de formulários

### Autenticação Google OAuth
- Login com conta Google
- Integração automática com NextAuth
- Perfil e avatar do Google

### Recursos de Segurança
- Sessões JWT
- Proteção de rotas
- Logout seguro
- Redirecionamento automático

## 📱 Páginas de Autenticação

- **Login**: `/auth/signin`
- **Registro**: `/auth/signup`
- **Logout**: Automático via dropdown do usuário

## 🔌 API Routes

- `POST /api/auth/register` - Registro de usuários
- `GET/POST /api/auth/[...nextauth]` - Rotas do NextAuth

## 🎨 Componentes

- `SignInForm` - Formulário de login
- `SignUpForm` - Formulário de registro
- `UserNav` - Navegação do usuário logado
- `NextAuthProvider` - Provider do NextAuth

## 🔒 Segurança

⚠️ **Importante**: Em produção, sempre:
- Use HTTPS
- Configure domínios corretos no Google OAuth
- Use variáveis de ambiente seguras
- Configure NEXTAUTH_URL corretamente
- Use uma chave secreta forte

## 🚀 Próximos Passos

1. Configure as credenciais do Google OAuth
2. Adicione as variáveis de ambiente
3. Execute as migrações
4. Teste o registro e login
5. Configure para produção

## 📞 Suporte

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Drizzle Adapter](https://authjs.dev/reference/adapter/drizzle)
