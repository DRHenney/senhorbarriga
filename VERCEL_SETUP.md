# Configuração do Vercel

## Variáveis de Ambiente Necessárias

Para que a aplicação funcione no Vercel, você precisa configurar as seguintes variáveis de ambiente:

### 1. Acesse o Dashboard do Vercel
- Vá para https://vercel.com/dashboard
- Selecione seu projeto `senhorbarriga`

### 2. Configure as Variáveis de Ambiente
Vá em **Settings** > **Environment Variables** e adicione:

#### DATABASE_URL
```
postgresql://neondb_owner:npg_fPoiDKLI4TZ8@ep-spring-term-adcnmist-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

#### NEXTAUTH_SECRET
```
sua-chave-secreta-aqui-32-caracteres-minimo
```

#### NEXTAUTH_URL
```
https://seu-dominio.vercel.app
```

### 3. Redeploy
Após configurar as variáveis:
1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment

## Problemas Comuns

### Erro de Build
Se o build falhar, verifique:
- Todas as variáveis estão configuradas
- A URL do banco está correta
- O NEXTAUTH_SECRET tem pelo menos 32 caracteres

### Erro de Conexão com Banco
Se não conseguir conectar ao banco:
- Verifique se o Neon está ativo
- Confirme se a DATABASE_URL está correta
- Teste a conexão localmente primeiro

## Teste Local

Para testar localmente:
1. Crie um arquivo `.env.local`
2. Adicione as variáveis acima
3. Execute `npm run dev`
4. Teste a aplicação em `http://localhost:3000`
