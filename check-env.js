console.log('🔍 Verificando variáveis de ambiente...\n');

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NÃO CONFIGURADA`);
  } else if (value.includes('[seu-') || value.includes('[sua-')) {
    console.log(`⚠️  ${varName}: VALOR PLACEHOLDER - ${value}`);
  } else {
    console.log(`✅ ${varName}: CONFIGURADA`);
  }
});

console.log('\n📋 Para configurar no Vercel:');
console.log('1. Acesse: https://vercel.com/dashboard');
console.log('2. Selecione seu projeto senhorbarriga');
console.log('3. Vá em Settings > Environment Variables');
console.log('4. Adicione as variáveis com os valores corretos');
console.log('\n🔗 DATABASE_URL: postgresql://neondb_owner:npg_fPoiDKLI4TZ8@ep-spring-term-adcnmist-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
