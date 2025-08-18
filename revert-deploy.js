const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Iniciando reversão do deploy para versão estável...');

try {
  // 1. Verificar se há mudanças não commitadas
  console.log('📋 Verificando status do git...');
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  
  if (status.trim()) {
    console.log('⚠️ Há mudanças não commitadas. Fazendo stash...');
    execSync('git stash', { stdio: 'inherit' });
  }

  // 2. Buscar por commits recentes que podem ter causado problemas
  console.log('🔍 Buscando commits recentes...');
  const recentCommits = execSync('git log --oneline -10', { encoding: 'utf8' });
  console.log('Commits recentes:');
  console.log(recentCommits);

  // 3. Verificar se há tags ou branches que representem versões estáveis
  console.log('🏷️ Verificando tags e branches...');
  try {
    const tags = execSync('git tag --sort=-version:refname | head -5', { encoding: 'utf8' });
    console.log('Tags disponíveis:');
    console.log(tags);
  } catch (error) {
    console.log('Nenhuma tag encontrada');
  }

  // 4. Fazer backup das configurações atuais
  console.log('💾 Fazendo backup das configurações atuais...');
  const backupDir = `backup-${Date.now()}`;
  fs.mkdirSync(backupDir, { recursive: true });
  
  const filesToBackup = [
    'package.json',
    'next.config.ts',
    'tailwind.config.ts',
    'src/app/page.tsx',
    'src/lib/database.ts',
    'src/lib/auth.ts'
  ];

  filesToBackup.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, `${backupDir}/${file}`);
      console.log(`✅ Backup de ${file} criado`);
    }
  });

  // 5. Restaurar configurações estáveis
  console.log('🔧 Restaurando configurações estáveis...');
  
  // Restaurar package.json com versões estáveis
  const stablePackageJson = {
    "name": "senhorbarriga",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "next lint",
      "db:generate": "drizzle-kit generate",
      "db:migrate": "drizzle-kit migrate",
      "db:studio": "drizzle-kit studio",
      "db:push": "drizzle-kit push"
    },
    "dependencies": {
      "@auth/drizzle-adapter": "^1.10.0",
      "@neondatabase/serverless": "^1.0.1",
      "@radix-ui/react-avatar": "^1.1.10",
      "@radix-ui/react-dialog": "^1.1.15",
      "@radix-ui/react-dropdown-menu": "^2.1.16",
      "@radix-ui/react-label": "^2.1.7",
      "@radix-ui/react-select": "^2.2.6",
      "@radix-ui/react-slot": "^1.2.3",
      "@radix-ui/react-tabs": "^1.1.13",
      "@radix-ui/react-toast": "^1.2.15",
      "autoprefixer": "^10.4.21",
      "bcryptjs": "^3.0.2",
      "class-variance-authority": "^0.7.1",
      "clsx": "^2.1.1",
      "date-fns": "^4.1.0",
      "dotenv": "^17.2.1",
      "drizzle-kit": "^0.31.4",
      "drizzle-orm": "^0.44.4",
      "lucide-react": "^0.539.0",
      "next": "14.2.5",
      "next-auth": "^4.24.11",
      "pg": "^8.16.3",
      "react": "18.3.1",
      "react-dom": "18.3.1",
      "recharts": "^3.1.2",
      "tailwind-merge": "^3.3.1",
      "tailwindcss-animate": "^1.0.7"
    },
    "devDependencies": {
      "@types/bcryptjs": "^2.4.6",
      "@types/node": "^20",
      "@types/pg": "^8.15.5",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "eslint": "^8",
      "eslint-config-next": "14.2.5",
      "postcss": "^8",
      "tailwindcss": "^3.4.1",
      "typescript": "^5"
    }
  };

  fs.writeFileSync('package.json', JSON.stringify(stablePackageJson, null, 2));
  console.log('✅ package.json restaurado para versão estável');

  // 6. Limpar node_modules e reinstalar
  console.log('🧹 Limpando dependências...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  console.log('📦 Reinstalando dependências...');
  execSync('npm install', { stdio: 'inherit' });

  // 7. Fazer commit das mudanças
  console.log('📝 Fazendo commit das correções...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix: revert to stable version - restore working dependencies"', { stdio: 'inherit' });

  // 8. Push para o repositório
  console.log('🚀 Enviando correções para o repositório...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('✅ Reversão concluída!');
  console.log('📁 Backup salvo em:', backupDir);
  console.log('🔄 Aguarde o Vercel detectar as mudanças e fazer o novo deploy.');
  console.log('💡 Se ainda houver problemas, verifique as variáveis de ambiente no Vercel.');

} catch (error) {
  console.error('❌ Erro durante a reversão:', error.message);
  console.log('🔧 Tente executar os comandos manualmente:');
  console.log('1. git stash (se houver mudanças não commitadas)');
  console.log('2. npm install (para reinstalar dependências)');
  console.log('3. git add . && git commit -m "fix: restore stable version"');
  console.log('4. git push origin main');
}
