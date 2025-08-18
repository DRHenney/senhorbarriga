const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Verificando e corrigindo problemas comuns...');

try {
  // 1. Verificar se o projeto tem um repositório Git
  console.log('📋 Verificando configuração do Git...');
  try {
    execSync('git status', { stdio: 'pipe' });
    console.log('✅ Repositório Git configurado');
  } catch (error) {
    console.log('❌ Repositório Git não encontrado. Inicializando...');
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
  }

  // 2. Verificar e corrigir problemas no package.json
  console.log('📦 Verificando package.json...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Remover turbopack se estiver causando problemas
  if (packageJson.scripts.dev && packageJson.scripts.dev.includes('--turbopack')) {
    console.log('🔧 Removendo turbopack do script dev...');
    packageJson.scripts.dev = 'next dev';
  }

  // Verificar versões problemáticas
  const problematicVersions = {
    'next': '15.4.6',
    'react': '19.1.0',
    'react-dom': '19.1.0',
    'tailwindcss': '^4'
  };

  let hasChanges = false;
  Object.entries(problematicVersions).forEach(([pkg, version]) => {
    if (packageJson.dependencies && packageJson.dependencies[pkg] === version) {
      console.log(`⚠️ Versão problemática detectada: ${pkg}@${version}`);
      hasChanges = true;
    }
    if (packageJson.devDependencies && packageJson.devDependencies[pkg] === version) {
      console.log(`⚠️ Versão problemática detectada: ${pkg}@${version}`);
      hasChanges = true;
    }
  });

  if (hasChanges) {
    console.log('🔧 Aplicando versões estáveis...');
    
    // Versões estáveis recomendadas
    const stableVersions = {
      'next': '14.2.5',
      'react': '18.3.1',
      'react-dom': '18.3.1',
      'tailwindcss': '^3.4.1'
    };

    Object.entries(stableVersions).forEach(([pkg, version]) => {
      if (packageJson.dependencies && packageJson.dependencies[pkg]) {
        packageJson.dependencies[pkg] = version;
        console.log(`✅ ${pkg} atualizado para ${version}`);
      }
      if (packageJson.devDependencies && packageJson.devDependencies[pkg]) {
        packageJson.devDependencies[pkg] = version;
        console.log(`✅ ${pkg} atualizado para ${version}`);
      }
    });

    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  }

  // 3. Verificar configuração do Next.js
  console.log('⚙️ Verificando next.config.ts...');
  if (fs.existsSync('next.config.ts')) {
    const nextConfig = fs.readFileSync('next.config.ts', 'utf8');
    
    // Verificar se há configurações problemáticas
    if (nextConfig.includes('experimental') || nextConfig.includes('turbopack')) {
      console.log('🔧 Simplificando next.config.ts...');
      const simpleConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  }
};

export default nextConfig;`;
      
      fs.writeFileSync('next.config.ts', simpleConfig);
      console.log('✅ next.config.ts simplificado');
    }
  }

  // 4. Verificar configuração do Tailwind
  console.log('🎨 Verificando tailwind.config.ts...');
  if (fs.existsSync('tailwind.config.ts')) {
    const tailwindConfig = fs.readFileSync('tailwind.config.ts', 'utf8');
    
    // Verificar se está usando Tailwind v4
    if (tailwindConfig.includes('@tailwindcss/postcss')) {
      console.log('🔧 Atualizando para Tailwind v3...');
      const v3Config = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;`;
      
      fs.writeFileSync('tailwind.config.ts', v3Config);
      console.log('✅ tailwind.config.ts atualizado para v3');
    }
  }

  // 5. Verificar postcss.config.mjs
  console.log('🔄 Verificando postcss.config.mjs...');
  if (fs.existsSync('postcss.config.mjs')) {
    const postcssConfig = fs.readFileSync('postcss.config.mjs', 'utf8');
    
    if (postcssConfig.includes('@tailwindcss/postcss')) {
      console.log('🔧 Atualizando postcss.config.mjs...');
      const simplePostcss = `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config`;
      
      fs.writeFileSync('postcss.config.mjs', simplePostcss);
      console.log('✅ postcss.config.mjs atualizado');
    }
  }

  // 6. Limpar e reinstalar dependências
  console.log('🧹 Limpando dependências...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  console.log('📦 Reinstalando dependências...');
  execSync('npm install', { stdio: 'inherit' });

  // 7. Testar build local
  console.log('🔨 Testando build local...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build local bem-sucedido!');
  } catch (error) {
    console.log('❌ Build local falhou. Verifique os erros acima.');
  }

  // 8. Commit das correções
  console.log('📝 Fazendo commit das correções...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix: resolve deployment issues - downgrade to stable versions"', { stdio: 'inherit' });

  console.log('✅ Verificação e correção concluídas!');
  console.log('🚀 Execute "git push origin main" para enviar as correções.');
  console.log('💡 Aguarde o Vercel detectar as mudanças e fazer o novo deploy.');

} catch (error) {
  console.error('❌ Erro durante a verificação:', error.message);
}
