const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 DIAGNÓSTICO COMPLETO DO PROJETO');
console.log('=====================================');

try {
  // 1. Verificar estrutura do projeto
  console.log('\n📁 1. ESTRUTURA DO PROJETO');
  const requiredDirs = ['src', 'src/app', 'src/components', 'src/lib', 'src/app/api'];
  const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'src/lib/database.ts',
    'src/lib/schema.ts'
  ];

  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir}`);
    } else {
      console.log(`❌ ${dir} - FALTANDO`);
    }
  });

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - FALTANDO`);
    }
  });

  // 2. Verificar package.json
  console.log('\n📦 2. DEPENDÊNCIAS');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Verificar versões críticas
  const criticalDeps = {
    'next': '14.2.5',
    'react': '18.3.1',
    'react-dom': '18.3.1',
    'typescript': '^5'
  };

  Object.entries(criticalDeps).forEach(([dep, expectedVersion]) => {
    const currentVersion = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    if (currentVersion) {
      if (currentVersion.includes(expectedVersion)) {
        console.log(`✅ ${dep}: ${currentVersion}`);
      } else {
        console.log(`⚠️ ${dep}: ${currentVersion} (esperado: ${expectedVersion})`);
      }
    } else {
      console.log(`❌ ${dep}: FALTANDO`);
    }
  });

  // 3. Verificar configurações
  console.log('\n⚙️ 3. CONFIGURAÇÕES');
  
  // Next.js config
  if (fs.existsSync('next.config.js')) {
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');
    if (nextConfig.includes('serverComponentsExternalPackages')) {
      console.log('✅ Next.js config com serverComponentsExternalPackages');
    } else {
      console.log('⚠️ Next.js config sem serverComponentsExternalPackages');
    }
  }

  // TypeScript config
  if (fs.existsSync('tsconfig.json')) {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    if (tsConfig.compilerOptions?.paths?.['@/*']) {
      console.log('✅ TypeScript paths configurado');
    } else {
      console.log('❌ TypeScript paths não configurado');
    }
  }

  // 4. Verificar problemas comuns
  console.log('\n🐛 4. PROBLEMAS IDENTIFICADOS');
  
  // Verificar console.log no código
  const srcFiles = getAllFiles('src');
  let consoleLogCount = 0;
  srcFiles.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/console\.(log|error|warn)/g);
      if (matches) {
        consoleLogCount += matches.length;
      }
    }
  });
  
  if (consoleLogCount > 0) {
    console.log(`⚠️ ${consoleLogCount} console.log/error encontrados no código`);
  } else {
    console.log('✅ Nenhum console.log encontrado');
  }

  // Verificar imports problemáticos
  let importIssues = 0;
  srcFiles.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('import.*from.*@/') && !content.includes('@/components/') && !content.includes('@/lib/')) {
        importIssues++;
      }
    }
  });
  
  if (importIssues > 0) {
    console.log(`⚠️ ${importIssues} arquivos com imports potencialmente problemáticos`);
  } else {
    console.log('✅ Imports verificados');
  }

  // 5. Verificar banco de dados
  console.log('\n🗄️ 5. BANCO DE DADOS');
  
  if (fs.existsSync('src/lib/database.ts')) {
    const dbFile = fs.readFileSync('src/lib/database.ts', 'utf8');
    if (dbFile.includes('process.env.DATABASE_URL')) {
      console.log('✅ Configuração de banco encontrada');
    } else {
      console.log('❌ Configuração de banco não encontrada');
    }
  }

  if (fs.existsSync('src/lib/schema.ts')) {
    const schemaFile = fs.readFileSync('src/lib/schema.ts', 'utf8');
    if (schemaFile.includes('weeklyRecords') && schemaFile.includes('userTokens')) {
      console.log('✅ Schema com tabelas principais');
    } else {
      console.log('⚠️ Schema pode estar incompleto');
    }
  }

  // 6. Verificar APIs
  console.log('\n🔌 6. APIs');
  
  const apiDirs = ['src/app/api/records', 'src/app/api/tokens', 'src/app/api/auth'];
  apiDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir}`);
    } else {
      console.log(`❌ ${dir} - FALTANDO`);
    }
  });

  console.log('\n✅ DIAGNÓSTICO CONCLUÍDO');
  console.log('\n💡 RECOMENDAÇÕES:');
  console.log('1. Execute npm run build para testar a compilação');
  console.log('2. Verifique as variáveis de ambiente (.env.local)');
  console.log('3. Teste as APIs individualmente');
  console.log('4. Execute npm run lint para verificar código');

} catch (error) {
  console.error('❌ Erro no diagnóstico:', error.message);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}
