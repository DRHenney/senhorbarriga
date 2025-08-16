# Senhor Barriga - Dashboard Financeiro

Uma aplicação web moderna para acompanhar investimentos em pools de liquidez e robôs de grid trading.

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **React** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **ShadCN/ui** - Componentes de UI modernos e acessíveis
- **Recharts** - Biblioteca de gráficos para React
- **Lucide React** - Ícones modernos

## ✨ Funcionalidades

### Dashboard Principal
- **Cards de Resumo**: Valor total, Pool de Liquidez e Robô Grid
- **Gráfico de Evolução**: Linha temporal mostrando crescimento dos investimentos
- **Gráfico de Distribuição**: Pizza chart com composição do portfólio
- **Formulário de Entrada**: Adicionar novos registros semanais

### Página de Histórico
- **Tabela Detalhada**: Todos os registros com cálculos de crescimento
- **Métricas de Resumo**: Total investido, crescimento médio e período
- **Funcionalidades**: Filtros e exportação (preparado para implementação)

## 🛠️ Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd senhorbarriga
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📁 Estrutura do Projeto

```
senhorbarriga/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── historico/
│   │   │   └── page.tsx          # Página de histórico
│   │   ├── layout.tsx            # Layout principal
│   │   └── globals.css           # Estilos globais
│   └── components/
│       └── ui/                   # Componentes ShadCN/ui
│           ├── button.tsx
│           ├── card.tsx
│           ├── input.tsx
│           └── table.tsx
├── lib/
│   └── utils.ts                  # Utilitários
├── components.json               # Configuração ShadCN/ui
├── tailwind.config.ts           # Configuração Tailwind
└── package.json
```

## 🎨 Design System

A aplicação utiliza o design system do ShadCN/ui com:
- **Cores**: Sistema de cores baseado em HSL com suporte a tema escuro
- **Tipografia**: Fonte Geist Sans para texto e Geist Mono para código
- **Componentes**: Botões, cards, inputs e tabelas consistentes
- **Responsividade**: Layout adaptável para desktop e mobile

## 📊 Dados e Gráficos

### Tipos de Gráficos
- **LineChart**: Evolução temporal dos investimentos
- **PieChart**: Distribuição percentual do portfólio
- **Tabela**: Histórico detalhado com cálculos de crescimento

### Métricas Calculadas
- Crescimento semanal (pool e grid)
- Crescimento total do portfólio
- Percentuais de distribuição
- Médias e totais

## 🔮 Próximos Passos

### Funcionalidades Planejadas
- [ ] Persistência de dados (banco de dados)
- [ ] Autenticação de usuários
- [ ] Exportação para Excel/CSV
- [ ] Filtros avançados por período
- [ ] Notificações de alerta
- [ ] Múltiplas moedas
- [ ] Integração com APIs de exchanges

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] Otimização de performance
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Backup automático

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório ou entre em contato.

---

Desenvolvido com ❤️ para facilitar o acompanhamento de investimentos em DeFi
