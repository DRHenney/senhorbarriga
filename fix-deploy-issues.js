const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Corrigindo problemas de deploy identificados...');

try {
  // 1. Verificar e corrigir package.json
  console.log('📦 Verificando package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Remover dependências problemáticas que podem causar conflitos
  const problematicDeps = [
    '@tailwindcss/postcss',
    '@types/bcryptjs',
    '@types/pg'
  ];
  
  problematicDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      delete packageJson.dependencies[dep];
      console.log(`✅ Removido ${dep} das dependencies`);
    }
  });
  
  // Mover tipos para devDependencies se necessário
  if (!packageJson.devDependencies['@types/bcryptjs']) {
    packageJson.devDependencies['@types/bcryptjs'] = '^2.4.6';
  }
  if (!packageJson.devDependencies['@types/pg']) {
    packageJson.devDependencies['@types/pg'] = '^8.15.5';
  }
  
  // Garantir versões estáveis
  packageJson.dependencies['next'] = '14.2.5';
  packageJson.dependencies['react'] = '18.3.1';
  packageJson.dependencies['react-dom'] = '18.3.1';
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json corrigido');

  // 2. Corrigir next.config.js
  console.log('⚙️ Corrigindo next.config.js...');
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  }
};

module.exports = nextConfig;`;
  
  fs.writeFileSync('next.config.js', nextConfig);
  console.log('✅ next.config.js simplificado');

  // 3. Verificar se há arquivo .env.local
  console.log('🔐 Verificando variáveis de ambiente...');
  if (!fs.existsSync('.env.local')) {
    const envTemplate = `# Variáveis de Ambiente
DATABASE_URL="postgresql://neondb_owner:npg_fPoiDKLI4TZ8@ep-spring-term-adcnmist-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_SECRET="minha-chave-secreta-super-segura-2024-senhorbarriga"
NEXTAUTH_URL="http://localhost:3000"`;
    
    fs.writeFileSync('.env.local', envTemplate);
    console.log('⚠️ Arquivo .env.local criado - Configure as variáveis');
  }

  // 4. Limpar cache e node_modules
  console.log('🧹 Limpando cache...');
  if (fs.existsSync('.next')) {
    execSync('Remove-Item -Recurse -Force .next', { stdio: 'inherit' });
  }
  if (fs.existsSync('node_modules')) {
    execSync('Remove-Item -Recurse -Force node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  // 5. Reinstalar dependências
  console.log('📦 Reinstalando dependências...');
  execSync('npm install', { stdio: 'inherit' });

  // 6. Testar build
  console.log('🔨 Testando build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build bem-sucedido!');
  } catch (error) {
    console.log('❌ Build falhou - verifique os erros acima');
    return;
  }

  // 7. Commit e push
  console.log('📝 Fazendo commit das correções...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix: corrigir problemas de deploy - simplificar configurações - remover dependências conflitantes - garantir versões estáveis"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('✅ Correções aplicadas e enviadas! Aguarde o Vercel detectar as mudanças.');

} catch (error) {
  console.error('❌ Erro:', error.message);
}
