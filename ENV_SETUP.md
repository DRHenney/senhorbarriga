# Configuração das Variáveis de Ambiente

## 🔧 Passo 1: Criar arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# Configuração do banco de dados Neon
# Substitua pela sua string de conexão real do Neon
DATABASE_URL="postgresql://[seu-usuario]:[sua-senha]@[seu-host]/[seu-banco]?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="sua-chave-secreta-aqui-gerada-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional - configure se quiser usar login com Google)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

## 🔑 Passo 2: Obter a string de conexão do Neon

1. Acesse: https://console.neon.tech/app/projects/lucky-poetry-11420099?branchId=br-autumn-leaf-adgix16m
2. Clique em "Connection Details"
3. Copie a string de conexão
4. Substitua no arquivo `.env.local`

## 🔐 Passo 3: Gerar NEXTAUTH_SECRET

Execute no terminal:
```bash
openssl rand -base64 32
```

Ou use um gerador online de chaves secretas.

## 🚀 Passo 4: Executar migrações

Após configurar o `.env.local`, execute:

```bash
npm run db:push
```

## 📝 Exemplo de .env.local configurado:

```env
DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/senhorbarriga?sslmode=require"
NEXTAUTH_SECRET="abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"
```
