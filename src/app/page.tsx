"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

import { Plus, TrendingUp, DollarSign, CheckCircle, BarChart3, Target, Zap, Coins, Trash2 } from "lucide-react";
import Link from "next/link";

// Dados de exemplo
const chartData = [
  { week: "Semana 1", poolLiquidity: 5000, gridBot: 1200, total: 6200 },
  { week: "Semana 2", poolLiquidity: 5200, gridBot: 1350, total: 6550 },
  { week: "Semana 3", poolLiquidity: 5400, gridBot: 1400, total: 6800 },
  { week: "Semana 4", poolLiquidity: 5600, gridBot: 1500, total: 7100 },
  { week: "Semana 5", poolLiquidity: 5800, gridBot: 1600, total: 7400 },
];

// Dados para o gráfico de barras
const barChartData = [
  { week: "Semana 1", poolLiquidity: 5000, gridBot: 1200 },
  { week: "Semana 2", poolLiquidity: 5200, gridBot: 1350 },
  { week: "Semana 3", poolLiquidity: 5400, gridBot: 1400 },
  { week: "Semana 4", poolLiquidity: 5600, gridBot: 1500 },
  { week: "Semana 5", poolLiquidity: 5800, gridBot: 1600 },
];

const pieData = [
  { name: "Pool Liquidez", value: 5800, color: "#475569" },
  { name: "Grid Bot", value: 1600, color: "#64748b" },
];

// Dados de exemplo para tokens
const initialTokens = [
  { id: 1, name: "Bitcoin", symbol: "BTC", amount: 0.5, price: 45000, value: 22500 },
  { id: 2, name: "Ethereum", symbol: "ETH", amount: 3.2, price: 2800, value: 8960 },
  { id: 3, name: "Cardano", symbol: "ADA", amount: 5000, price: 0.45, value: 2250 },
];

// Dados para o gráfico de portfólio total
const portfolioChartData = [
  { month: "Jan", value: 28000 },
  { month: "Fev", value: 29500 },
  { month: "Mar", value: 31200 },
  { month: "Abr", value: 29800 },
  { month: "Mai", value: 32500 },
  { month: "Jun", value: 34100 },
  { month: "Jul", value: 35800 },
  { month: "Ago", value: 37200 },
];

export default function Home() {
  const [newEntry, setNewEntry] = useState({
    poolLiquidity: "",
    gridBot: "",
  });

  const [tokens, setTokens] = useState(initialTokens);
  const [newToken, setNewToken] = useState({
    name: "",
    symbol: "",
    amount: "",
    price: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const totalValue = chartData[chartData.length - 1]?.total || 0;
  const poolLiquidity = chartData[chartData.length - 1]?.poolLiquidity || 0;
  const gridBot = chartData[chartData.length - 1]?.gridBot || 0;

  // Calcular valor total do portfólio de tokens
  const portfolioTotal = tokens.reduce((sum, token) => sum + token.value, 0);

  // Calcular valor total geral (DeFi + Tokens)
  const totalPortfolioValue = totalValue + portfolioTotal;

  // Calcular crescimento percentual
  const portfolioGrowth = ((portfolioChartData[portfolioChartData.length - 1].value - portfolioChartData[0].value) / portfolioChartData[0].value * 100).toFixed(1);

  // Adicionar novo token
  const addToken = () => {
    if (newToken.name && newToken.symbol && newToken.amount && newToken.price) {
      const amount = parseFloat(newToken.amount);
      const price = parseFloat(newToken.price);
      const value = amount * price;
      
      const token = {
        id: Date.now(),
        name: newToken.name,
        symbol: newToken.symbol.toUpperCase(),
        amount: amount,
        price: price,
        value: value,
      };
      
      setTokens([...tokens, token]);
      setNewToken({ name: "", symbol: "", amount: "", price: "" });
    }
  };

  // Remover token
  const removeToken = (id: number) => {
    setTokens(tokens.filter(token => token.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Header com gradiente Slate */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-600/30 rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold">Senhor Barriga DeFi</h1>
              </div>
              <p className="text-slate-300 text-lg">Acompanhe suas finanças de forma inteligente</p>
            </div>
            <div className="flex items-center space-x-2 bg-slate-600/30 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-slate-300" />
              <span className="text-sm font-medium">Deploy Automático Ativo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Card de Portfólio Total com Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                {/* Header do Card */}
                <div className="mb-6">
                  <h3 className="text-slate-300 text-sm font-medium mb-2">Portfólio Total</h3>
                  <div className="text-3xl font-bold text-white mb-2">{formatCurrency(totalPortfolioValue)}</div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-slate-300" />
                    <span className="text-slate-300 text-sm font-medium">+{portfolioGrowth}% desde janeiro</span>
                  </div>
                </div>
                
                {/* Gráfico de Linha */}
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={portfolioChartData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#64748b" 
                        strokeWidth={3}
                        dot={{ fill: '#64748b', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#64748b', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Resumo Rápido */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Resumo Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">DeFi Total:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tokens:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(portfolioTotal)}</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-medium">Total Geral:</span>
                  <span className="text-xl font-bold text-slate-900">{formatCurrency(totalPortfolioValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Resumo com design melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Valor Total</CardTitle>
              <div className="p-2 bg-slate-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalValue)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-600 font-medium">+12.5% este mês</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pool de Liquidez</CardTitle>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Target className="h-5 w-5 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(poolLiquidity)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-600 font-medium">+8.2% esta semana</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Grid Bot</CardTitle>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Zap className="h-5 w-5 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(gridBot)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-600 font-medium">+15.3% esta semana</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Portfólio Tokens</CardTitle>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Coins className="h-5 w-5 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(portfolioTotal)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-600 font-medium">{tokens.length} tokens</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Portfólio de Tokens */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-semibold text-slate-800">Portfólio de Tokens</CardTitle>
            <CardDescription className="text-slate-600">Gerencie seus tokens e acompanhe o valor total do portfólio</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Formulário para adicionar token */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome do Token</label>
                <Input
                  placeholder="Ex: Bitcoin"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  className="border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Símbolo</label>
                <Input
                  placeholder="Ex: BTC"
                  value={newToken.symbol}
                  onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                  className="border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Quantidade</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newToken.amount}
                  onChange={(e) => setNewToken({ ...newToken, amount: e.target.value })}
                  className="border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Preço ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newToken.price}
                  onChange={(e) => setNewToken({ ...newToken, price: e.target.value })}
                  className="border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <Button 
                onClick={addToken}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Token
              </Button>
            </div>

            {/* Lista de tokens */}
            <div className="space-y-3">
              {tokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{token.name}</h3>
                      <p className="text-sm text-slate-600">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-600">{token.amount} {token.symbol}</p>
                      <p className="text-sm text-slate-500">${token.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{formatCurrency(token.value)}</p>
                      <p className="text-sm text-slate-500">{((token.value / portfolioTotal) * 100).toFixed(1)}% do portfólio</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeToken(token.id)}
                      className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo do portfólio */}
            <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Valor Total do Portfólio</h3>
                  <p className="text-sm text-slate-600">{tokens.length} tokens • Última atualização: agora</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900">{formatCurrency(portfolioTotal)}</p>
                  <p className="text-sm text-slate-600 font-medium">+5.2% esta semana</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos com design melhorado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl border-slate-200">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-xl font-semibold text-slate-800">Evolução Semanal</CardTitle>
              <CardDescription className="text-slate-600">Valores de Pool de Liquidez e Grid Bot por semana</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barChartData}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    stroke="#64748b"
                  />
                  <YAxis
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    stroke="#64748b"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="poolLiquidity" fill="#475569" radius={4} name="Pool de Liquidez" />
                  <Bar dataKey="gridBot" fill="#64748b" radius={4} name="Grid Bot" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm border-t border-slate-200">
              <div className="flex gap-2 leading-none font-medium text-slate-700">
                Crescimento de {((barChartData[barChartData.length - 1].poolLiquidity + barChartData[barChartData.length - 1].gridBot - barChartData[0].poolLiquidity - barChartData[0].gridBot) / (barChartData[0].poolLiquidity + barChartData[0].gridBot) * 100).toFixed(1)}% no período <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-slate-600 leading-none">
                Mostrando evolução semanal dos investimentos nas últimas 5 semanas
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl border-slate-200">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-xl font-semibold text-slate-800">Distribuição Atual</CardTitle>
              <CardDescription className="text-slate-600">Proporção entre pool de liquidez e grid bot</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Formulário com design melhorado */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl border-slate-200">
          <CardHeader className="border-b border-slate-200">
            <CardTitle className="text-xl font-semibold text-slate-800">Adicionar Nova Entrada Semanal</CardTitle>
            <CardDescription className="text-slate-600">Registre seus valores de pool de liquidez e grid bot</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="poolLiquidity" className="text-sm font-medium text-slate-700">
                  Pool de Liquidez ($)
                </label>
                <Input
                  id="poolLiquidity"
                  type="number"
                  placeholder="0.00"
                  value={newEntry.poolLiquidity}
                  onChange={(e) => setNewEntry({ ...newEntry, poolLiquidity: e.target.value })}
                  className="h-12 text-lg border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="gridBot" className="text-sm font-medium text-slate-700">
                  Grid Bot ($)
                </label>
                <Input
                  id="gridBot"
                  type="number"
                  placeholder="0.00"
                  value={newEntry.gridBot}
                  onChange={(e) => setNewEntry({ ...newEntry, gridBot: e.target.value })}
                  className="h-12 text-lg border-slate-200 focus:border-slate-500 focus:ring-slate-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => {
                  // Lógica para adicionar nova entrada
                  console.log("Nova entrada:", newEntry);
                  setNewEntry({ poolLiquidity: "", gridBot: "" });
                }}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Entrada
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link para Histórico com design melhorado */}
        <div className="flex justify-center">
          <Link href="/historico">
            <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700 hover:text-slate-900 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              <BarChart3 className="h-5 w-5 mr-2" />
              Ver Histórico Completo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
