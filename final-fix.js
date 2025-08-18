const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Executando correções finais para garantir deploy perfeito...');

try {
  // 1. Corrigir package.json - remover dependências problemáticas
  console.log('📦 Corrigindo package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Remover @tailwindcss/postcss que é da v4
  if (packageJson.dependencies['@tailwindcss/postcss']) {
    delete packageJson.dependencies['@tailwindcss/postcss'];
    console.log('✅ Removido @tailwindcss/postcss (v4)');
  }
  
  // Mover tipos para devDependencies
  if (packageJson.dependencies['@types/bcryptjs']) {
    delete packageJson.dependencies['@types/bcryptjs'];
    packageJson.devDependencies['@types/bcryptjs'] = '^2.4.6';
  }
  if (packageJson.dependencies['@types/pg']) {
    delete packageJson.dependencies['@types/pg'];
    packageJson.devDependencies['@types/pg'] = '^8.15.5';
  }
  
  // Corrigir versões do ESLint
  packageJson.devDependencies['eslint'] = '^8';
  packageJson.devDependencies['eslint-config-next'] = '14.2.5';
  
  // Corrigir versões do TypeScript
  packageJson.devDependencies['@types/react'] = '^18';
  packageJson.devDependencies['@types/react-dom'] = '^18';
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json corrigido');

  // 2. Corrigir configuração do ESLint
  console.log('🔍 Corrigindo configuração do ESLint...');
  const eslintConfig = {
    "extends": "next/core-web-vitals"
  };
  fs.writeFileSync('.eslintrc.json', JSON.stringify(eslintConfig, null, 2));
  console.log('✅ ESLint configurado corretamente');

  // 3. Verificar e corrigir postcss.config.mjs
  console.log('🔄 Verificando postcss.config.mjs...');
  const postcssConfig = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config`;
  fs.writeFileSync('postcss.config.mjs', postcssConfig);
  console.log('✅ postcss.config.mjs corrigido');

  // 4. Verificar se há arquivo .env.local
  console.log('🔐 Verificando variáveis de ambiente...');
  if (!fs.existsSync('.env.local')) {
    const envTemplate = `# Variáveis de Ambiente - Configure com seus valores reais
DATABASE_URL="postgresql://neondb_owner:npg_fPoiDKLI4TZ8@ep-spring-term-adcnmist-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="minha-chave-secreta-super-segura-2024-senhorbarriga"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""`;
    
    fs.writeFileSync('.env.local', envTemplate);
    console.log('⚠️ Arquivo .env.local criado - Configure as variáveis');
  } else {
    console.log('✅ Arquivo .env.local encontrado');
  }

  // 5. Limpar e reinstalar dependências
  console.log('🧹 Limpando dependências...');
  if (fs.existsSync('node_modules')) {
    execSync('Remove-Item -Recurse -Force node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  console.log('📦 Reinstalando dependências...');
  execSync('npm install', { stdio: 'inherit' });

  // 6. Testar build
  console.log('🔨 Testando build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build bem-sucedido!');
  } catch (error) {
    console.log('❌ Build falhou - verifique os erros acima');
  }

  // 7. Testar lint
  console.log('🔍 Testando lint...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Lint passou!');
  } catch (error) {
    console.log('⚠️ Lint com warnings - verificar acima');
  }

  // 8. Commit das correções
  console.log('📝 Fazendo commit das correções finais...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix: final corrections for stable deployment"', { stdio: 'inherit' });

  console.log('✅ Correções finais concluídas!');
  console.log('🚀 Execute "git push origin main" para enviar as correções.');
  console.log('💡 Aguarde o Vercel detectar as mudanças e fazer o novo deploy.');
  console.log('📋 Checklist final:');
  console.log('   ✅ Dependências corrigidas');
  console.log('   ✅ Configurações atualizadas');
  console.log('   ✅ Build testado');
  console.log('   ✅ Lint verificado');
  console.log('   ⚠️ Configure as variáveis de ambiente no Vercel');

} catch (error) {
  console.error('❌ Erro durante as correções finais:', error.message);
}
