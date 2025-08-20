# 🤖 Push Automático - SenhorBarriga

## Como Usar

### 1. **Push Manual Simples**
```bash
npm run push
```
- Faz commit e push de todas as mudanças
- Usa mensagem padrão: "feat: atualização automática"

### 2. **Push Manual com Mensagem Personalizada**
```bash
npm run push "sua mensagem personalizada"
```

### 3. **Monitoramento Automático (Recomendado)**
```bash
npm run push:watch
```
- Monitora mudanças nos arquivos automaticamente
- Faz push após 2 segundos de inatividade
- Para parar: `Ctrl+C`

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run push` | Push manual simples |
| `npm run push:watch` | Monitoramento automático |
| `npm run auto-push` | Alias para push manual |

## Como Funciona

### **Push Manual**
- Verifica se há mudanças
- Adiciona todos os arquivos (`git add .`)
- Faz commit com a mensagem especificada
- Faz push para `origin/main`

### **Monitoramento Automático**
- Monitora o diretório `src/` em tempo real
- Detecta mudanças em qualquer arquivo
- Aguarda 2 segundos de inatividade
- Faz push automaticamente
- Evita pushes duplicados

## Exemplos de Uso

```bash
# Push simples
npm run push

# Push com mensagem personalizada
npm run push "fix: corrigir bug na atualização automática"

# Iniciar monitoramento automático
npm run push:watch
```

## Logs

O sistema mostra logs detalhados:
- 🤖 Iniciando push automático...
- 📝 Mudanças detectadas, fazendo commit...
- 🚀 Fazendo push...
- ✅ Push automático concluído com sucesso!

## Configuração

Os scripts estão configurados para:
- **Branch**: `main`
- **Remote**: `origin`
- **Timeout**: 2 segundos (monitoramento)
- **Diretório monitorado**: `src/`

## Dicas

1. **Para desenvolvimento**: Use `npm run push:watch` e deixe rodando
2. **Para mudanças pontuais**: Use `npm run push`
3. **Sempre especifique mensagens descritivas** para commits importantes
4. **O monitoramento ignora** arquivos do `node_modules` e `.git`
