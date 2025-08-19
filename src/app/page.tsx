"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Label } from "recharts";

import { Plus, TrendingUp, DollarSign, BarChart3, Target, Zap, Coins, Trash2, Calendar, User } from "lucide-react";
import Link from "next/link";
import DatabaseStatus from "@/components/DatabaseStatus";
import UserNav from "@/components/auth/UserNav";

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



// Dados para resumo mensal
const monthlyData = [
  { name: "Janeiro", poolLiquidity: 4800, gridBot: 1100, total: 5900 },
  { name: "Fevereiro", poolLiquidity: 5200, gridBot: 1250, total: 6450 },
  { name: "Março", poolLiquidity: 5400, gridBot: 1350, total: 6750 },
  { name: "Abril", poolLiquidity: 5600, gridBot: 1450, total: 7050 },
  { name: "Maio", poolLiquidity: 5800, gridBot: 1550, total: 7350 },
  { name: "Junho", poolLiquidity: 6000, gridBot: 1650, total: 7650 },
];

// Calcular totais mensais
const totalMonthlyPool = monthlyData.reduce((sum, month) => sum + month.poolLiquidity, 0);
const totalMonthlyGrid = monthlyData.reduce((sum, month) => sum + month.gridBot, 0);
const totalMonthlyValue = totalMonthlyPool + totalMonthlyGrid;



// Dados de exemplo para tokens (serão carregados do banco)
const initialTokens: Array<{
  id: number;
  name: string;
  symbol: string;
  amount: number;
  price: number;
  value: number;
}> = [];

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
    recordDate: new Date().toISOString().split('T')[0], // Data atual como padrão
    notes: "",
  });

  const [records, setRecords] = useState<Array<{
    id: number;
    poolLiquidity: number;
    gridBot: number;
    total: number;
    weekNumber: number;
    year: number;
    recordDate: string;
    notes?: string;
    createdAt: string;
  }>>([]);

  const [editingRecord, setEditingRecord] = useState<{
    id: number;
    poolLiquidity: number;
    gridBot: number;
    recordDate: string;
    notes?: string;
  } | null>(null);

  const [tokens, setTokens] = useState<Array<{
    id: number;
    name: string;
    symbol: string;
    amount: number;
    price: number;
    value: number;
  }>>(initialTokens);
  const [activeTab, setActiveTab] = useState("current"); // "current" ou "monthly"
  const [evolutionTab, setEvolutionTab] = useState("weekly"); // "weekly" ou "records"
  const [newToken, setNewToken] = useState({
    name: "",
    symbol: "",
    amount: "",
    price: "",
  });

  // Estado para edição de tokens
  const [editingToken, setEditingToken] = useState<{
    id: number;
    name: string;
    symbol: string;
    amount: number;
    price: number;
  } | null>(null);

  const [editForm, setEditForm] = useState({
    action: "add" as "add" | "remove",
    amount: "",
    price: "",
  });

  // Verificar se todos os campos estão preenchidos
  const isFormComplete = newToken.name && newToken.symbol && newToken.amount && newToken.price;

  // Função para iniciar edição de token
  const editToken = (token: any) => {
    setEditingToken(token);
    setEditForm({ action: "add", amount: "", price: "" });
  };

  // Função para cancelar edição
  const cancelEdit = () => {
    setEditingToken(null);
    setEditForm({ action: "add", amount: "", price: "" });
  };

  // Função para aplicar edição
  const applyEdit = async () => {
    if (!editingToken || !editForm.amount) return;

    const editAmount = parseFloat(editForm.amount);
    if (isNaN(editAmount) || editAmount <= 0) {
      alert("Por favor, insira uma quantidade válida.");
      return;
    }

    const currentToken = tokens.find(t => t.id === editingToken.id);
    if (!currentToken) return;

    let updatedToken;
    if (editForm.action === "add") {
      // Adicionar tokens com preço médio
      const editPrice = editForm.price ? parseFloat(editForm.price) : currentToken.price;
      
      if (isNaN(editPrice) || editPrice <= 0) {
        alert("Por favor, insira um preço válido.");
        return;
      }

      // Calcular preço médio ponderado
      const currentValue = currentToken.amount * currentToken.price;
      const newValue = editAmount * editPrice;
      const totalValue = currentValue + newValue;
      const totalAmount = currentToken.amount + editAmount;
      const averagePrice = totalValue / totalAmount;

      const newAmount = Number(totalAmount.toFixed(2));
      const newPrice = Number(averagePrice.toFixed(2));
      const finalValue = Number((newAmount * newPrice).toFixed(2));
      
      console.log('Debug - Adicionando tokens com preço médio:', {
        currentAmount: currentToken.amount,
        currentPrice: currentToken.price,
        editAmount: editAmount,
        editPrice: editPrice,
        newAmount: newAmount,
        newPrice: newPrice,
        finalValue: finalValue
      });
      
      updatedToken = {
        ...currentToken,
        amount: newAmount,
        price: newPrice,
        value: finalValue,
      };
    } else {
      // Remover tokens (mantém o preço atual)
      if (editAmount > currentToken.amount) {
        alert("Não é possível remover mais tokens do que você possui!");
        return;
      }
      const newAmount = Number((currentToken.amount - editAmount).toFixed(2));
      const newValue = Number((newAmount * currentToken.price).toFixed(2));
      updatedToken = {
        ...currentToken,
        amount: newAmount,
        value: newValue,
      };
    }

    // Atualizar no banco de dados
    try {
      const response = await fetch('/api/tokens', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingToken.id,
          amount: updatedToken.amount,
          price: updatedToken.price,
          value: updatedToken.value,
        }),
      });
      
      const data = await response.json();
      
             if (data.success) {
         setTokens(tokens.map(t => t.id === editingToken.id ? updatedToken : t));
         setEditingToken(null);
         setEditForm({ action: "add", amount: "", price: "" });
       } else {
        alert('Erro ao atualizar token: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      alert('Erro ao atualizar token');
    }
  };

  const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const totalValue = chartData[chartData.length - 1]?.total || 0;
  const poolLiquidity = chartData[chartData.length - 1]?.poolLiquidity || 0;
  const gridBot = chartData[chartData.length - 1]?.gridBot || 0;

  // Calcular valor total do portfólio de tokens
  const portfolioTotal = tokens.reduce((sum, token) => {
    const tokenValue = token.value || 0;
    return sum + (isNaN(tokenValue) ? 0 : tokenValue);
  }, 0);

  // Calcular valor total geral (DeFi + Tokens)
  const totalPortfolioValue = totalValue + portfolioTotal;

  // Calcular crescimento percentual
  const portfolioGrowth = ((portfolioChartData[portfolioChartData.length - 1].value - portfolioChartData[0].value) / portfolioChartData[0].value * 100).toFixed(1);

  // Carregar tokens do banco
  const loadTokens = async () => {
    try {
      const response = await fetch('/api/tokens');
      const data = await response.json();
      
      if (data.success) {
        // Converter os valores string para number e corrigir casas decimais
        const processedTokens = data.tokens.map((token: any) => {
          const amount = parseFloat(token.amount);
          const price = parseFloat(token.price);
          const value = parseFloat(token.value);
          
          // Verificar se precisa corrigir as casas decimais
          const needsCorrection = 
            amount.toString().includes('.') && amount.toString().split('.')[1]?.length > 2 ||
            price.toString().includes('.') && price.toString().split('.')[1]?.length > 2 ||
            value.toString().includes('.') && value.toString().split('.')[1]?.length > 2;
          
          if (needsCorrection) {
            // Corrigir automaticamente no banco
            const correctedToken = {
              ...token,
              amount: Number(amount.toFixed(2)),
              price: Number(price.toFixed(2)),
              value: Number(value.toFixed(2))
            };
            
            // Atualizar no banco de dados
            fetch('/api/tokens', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: token.id,
                amount: correctedToken.amount,
                price: correctedToken.price,
                value: correctedToken.value,
              }),
            }).catch(error => console.error('Erro ao corrigir token:', error));
            
            return correctedToken;
          }
          
          return {
            ...token,
            amount: Number(amount.toFixed(2)),
            price: Number(price.toFixed(2)),
            value: Number(value.toFixed(2))
          };
        });
        
        setTokens(processedTokens);
      } else {
        console.error('Erro ao carregar tokens:', data.message);
      }
    } catch (error) {
      console.error('Erro ao carregar tokens:', error);
    }
  };

  // Carregar tokens ao montar o componente
  useEffect(() => {
    loadTokens();
    loadRecords();
  }, []);

  // Carregar registros do banco
  const loadRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.records);
      } else {
        console.error('Erro ao carregar registros:', data.message);
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  // Adicionar novo registro
  const addRecord = async () => {
    if (newEntry.poolLiquidity && newEntry.gridBot && newEntry.recordDate) {
      try {
        const response = await fetch('/api/records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newEntry),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setRecords([data.record, ...records]);
          setNewEntry({ 
            poolLiquidity: "", 
            gridBot: "", 
            recordDate: new Date().toISOString().split('T')[0],
            notes: "" 
          });
          alert('Registro adicionado com sucesso!');
        } else {
          alert('Erro ao adicionar registro: ' + data.message);
        }
      } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        alert('Erro ao adicionar registro');
      }
    }
  };

  // Editar registro
  const editRecord = (record: any) => {
    setEditingRecord({
      id: record.id,
      poolLiquidity: record.poolLiquidity,
      gridBot: record.gridBot,
      recordDate: record.recordDate.split('T')[0],
      notes: record.notes || "",
    });
  };

  // Aplicar edição de registro
  const applyRecordEdit = async () => {
    if (!editingRecord) return;

    try {
      const response = await fetch('/api/records', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingRecord),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRecords(records.map(r => r.id === editingRecord.id ? data.record : r));
        setEditingRecord(null);
        alert('Registro atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar registro: ' + data.message);
      }
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      alert('Erro ao atualizar registro');
    }
  };

  // Remover registro
  const removeRecord = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este registro?')) {
      try {
        const response = await fetch(`/api/records?id=${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          setRecords(records.filter(r => r.id !== id));
          alert('Registro removido com sucesso!');
        } else {
          alert('Erro ao remover registro: ' + data.message);
        }
      } catch (error) {
        console.error('Erro ao remover registro:', error);
        alert('Erro ao remover registro');
      }
    }
  };

  // Adicionar novo token
  const addToken = async () => {
    if (newToken.name && newToken.symbol && newToken.amount && newToken.price) {
      try {
        const amount = parseFloat(newToken.amount);
        const price = parseFloat(newToken.price);
        
        if (isNaN(amount) || isNaN(price) || amount <= 0 || price <= 0) {
          alert('Por favor, insira valores válidos para quantidade e preço.');
          return;
        }

        const tokenData = {
          ...newToken,
          amount: Number(amount.toFixed(2)),
          price: Number(price.toFixed(2)),
          value: Number((amount * price).toFixed(2)),
        };

        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tokenData),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTokens([...tokens, data.token]);
          setNewToken({ name: "", symbol: "", amount: "", price: "" });
          alert('Token adicionado com sucesso!');
        } else {
          alert('Erro ao adicionar token: ' + data.message);
        }
      } catch (error) {
        console.error('Erro ao adicionar token:', error);
        alert('Erro ao adicionar token');
      }
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
            <UserNav />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Nome do Token
                </label>
                <Input
                  placeholder="Ex: Bitcoin"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Símbolo
                </label>
                <Input
                  placeholder="Ex: BTC"
                  value={newToken.symbol}
                  onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium uppercase"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Quantidade
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newToken.amount}
                  onChange={(e) => setNewToken({ ...newToken, amount: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Preço ($)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newToken.price}
                  onChange={(e) => setNewToken({ ...newToken, price: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <Button 
                onClick={addToken}
                disabled={!isFormComplete}
                className={`px-8 py-3 text-lg font-semibold shadow-xl transition-all duration-300 transform hover:scale-105 border-0 ${
                  isFormComplete 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-2xl' 
                    : 'bg-gradient-to-r from-slate-400 to-slate-500 text-slate-200 cursor-not-allowed'
                }`}
              >
                <Plus className="h-5 w-5 mr-3" />
                {isFormComplete ? 'Adicionar Token' : 'Preencha todos os campos'}
              </Button>
            </div>

            {/* Lista de tokens */}
            <div className="space-y-3">
              {tokens.map((token) => (
                <div key={token.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  {editingToken?.id === token.id ? (
                    // Modo de edição
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{token.name}</h3>
                          <p className="text-sm text-slate-600">{token.symbol}</p>
                        </div>
                                                 <div className="text-right">
                           <p className="text-sm text-slate-600">Quantidade atual: {token.amount.toFixed(2)} {token.symbol}</p>
                           <p className="text-sm text-slate-500">Preço médio: ${token.price.toFixed(2)}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          <Button
                            variant={editForm.action === "add" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setEditForm({ ...editForm, action: "add" })}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Adicionar
                          </Button>
                          <Button
                            variant={editForm.action === "remove" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setEditForm({ ...editForm, action: "remove" })}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Remover
                          </Button>
                        </div>
                        
                                                 <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-700">
                             {editForm.action === "add" ? "Quantidade a adicionar" : "Quantidade a remover"}
                           </label>
                           <Input
                             type="number"
                             placeholder="0.00"
                             value={editForm.amount}
                             onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                             className="h-10 text-base border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium"
                           />
                         </div>
                         
                         {editForm.action === "add" && (
                           <div className="space-y-2">
                             <label className="text-sm font-medium text-slate-700">
                               Preço por token ($) - Opcional
                             </label>
                             <Input
                               type="number"
                               placeholder={`${token.price.toFixed(2)} (preço atual)`}
                               value={editForm.price}
                               onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                               className="h-10 text-base border-2 border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium"
                             />
                             <p className="text-xs text-slate-500">
                               Deixe vazio para usar o preço atual. Se informado, será calculado o preço médio ponderado.
                             </p>
                           </div>
                         )}
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={applyEdit}
                          disabled={!editForm.amount}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {editForm.action === "add" ? "Adicionar" : "Remover"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo de visualização
                    <div className="flex items-center justify-between">
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
                           <p className="text-sm text-slate-600">{token.amount.toFixed(2)} {token.symbol}</p>
                           <p className="text-sm text-slate-500">Preço médio: ${token.price.toFixed(2)}</p>
                         </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{formatCurrency(token.value)}</p>
                          <p className="text-sm text-slate-500">{portfolioTotal > 0 ? ((token.value / portfolioTotal) * 100).toFixed(1) : '0.0'}% do portfólio</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editToken(token)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeToken(token.id)}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    {evolutionTab === "weekly" ? "Evolução Semanal" : "Registros Semanais"}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {evolutionTab === "weekly" 
                      ? "Valores de Pool de Liquidez e Grid Bot por semana" 
                      : "Histórico dos seus registros semanais"
                    }
                  </CardDescription>
                </div>
                <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setEvolutionTab("weekly")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      evolutionTab === "weekly"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 inline mr-1" />
                    Semanal
                  </button>
                  <button
                    onClick={() => setEvolutionTab("records")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      evolutionTab === "records"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Registros
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {evolutionTab === "weekly" ? (
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
              ) : (
                <div className="space-y-4">
                  {records.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Nenhum registro encontrado</p>
                      <p className="text-sm text-slate-500">Adicione registros semanais para ver o histórico</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {records.slice(0, 10).map((record) => (
                        <div key={record.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <p className="text-sm font-medium text-slate-700">Semana {record.weekNumber}</p>
                                <p className="text-xs text-slate-500">{record.year}</p>
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">
                                  {new Date(record.recordDate).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </p>
                                {record.notes && (
                                  <p className="text-xs text-slate-500 italic">{record.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm text-slate-600">Pool: {formatCurrency(record.poolLiquidity)}</p>
                                <p className="text-sm text-slate-600">Grid: {formatCurrency(record.gridBot)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900">{formatCurrency(record.total)}</p>
                                <p className="text-sm text-slate-500">Total</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm border-t border-slate-200">
              {evolutionTab === "weekly" ? (
                <>
                  <div className="flex gap-2 leading-none font-medium text-slate-700">
                    Crescimento de {((barChartData[barChartData.length - 1].poolLiquidity + barChartData[barChartData.length - 1].gridBot - barChartData[0].poolLiquidity - barChartData[0].gridBot) / (barChartData[0].poolLiquidity + barChartData[0].gridBot) * 100).toFixed(1)}% no período <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-slate-600 leading-none">
                    Mostrando evolução semanal dos investimentos nas últimas 5 semanas
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2 leading-none font-medium text-slate-700">
                    {records.length > 0 ? `${records.length} registros encontrados` : 'Nenhum registro'}
                  </div>
                  <div className="text-slate-600 leading-none">
                    Mostrando os últimos 10 registros semanais
                  </div>
                </>
              )}
            </CardFooter>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl border-slate-200">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    {activeTab === "current" ? "Distribuição Atual" : "Resumo Mensal"}
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    {activeTab === "current" 
                      ? "Proporção entre pool de liquidez e grid bot" 
                      : "Acumulado dos últimos 6 meses"
                    }
                  </CardDescription>
                </div>
                <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("current")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "current"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Target className="h-4 w-4 inline mr-1" />
                    Atual
                  </button>
                  <button
                    onClick={() => setActiveTab("monthly")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "monthly"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Mensal
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {activeTab === "current" ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={5}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-slate-900 text-2xl font-bold"
                                >
                                  {formatCurrency(totalPortfolioValue)}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-slate-600 text-sm"
                                >
                                  Total
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
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
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
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
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm border-t border-slate-200">
              {activeTab === "current" ? (
                <>
                  <div className="flex gap-2 leading-none font-medium text-slate-700">
                    Pool de Liquidez: {formatCurrency(pieData[0].value)} ({((pieData[0].value / totalPortfolioValue) * 100).toFixed(0)}%)
                  </div>
                  <div className="flex gap-2 leading-none font-medium text-slate-700">
                    Grid Bot: {formatCurrency(pieData[1].value)} ({((pieData[1].value / totalPortfolioValue) * 100).toFixed(0)}%)
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2 leading-none font-medium text-slate-700">
                    Total Acumulado: {formatCurrency(totalMonthlyValue)} em {monthlyData.length} meses
                  </div>
                  <div className="flex gap-2 leading-none font-medium text-slate-700">
                    Crescimento: {((monthlyData[monthlyData.length - 1].total - monthlyData[0].total) / monthlyData[0].total * 100).toFixed(1)}% no período <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-slate-600 text-xs mt-1">
                    Média mensal: {formatCurrency(totalMonthlyValue / monthlyData.length)}
                  </div>
                </>
              )}
            </CardFooter>
          </Card>
        </div>

                 {/* Formulário com design melhorado */}
         <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl border-slate-200">
           <CardHeader className="border-b border-slate-200">
             <CardTitle className="text-xl font-semibold text-slate-800">Adicionar Nova Entrada Semanal</CardTitle>
             <CardDescription className="text-slate-600">Registre seus valores de pool de liquidez e grid bot com data</CardDescription>
           </CardHeader>
           <CardContent className="pt-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                   className="h-12 text-lg border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium"
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
                   className="h-12 text-lg border-2 border-slate-300 focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium"
                 />
               </div>
               <div className="space-y-3">
                 <label htmlFor="recordDate" className="text-sm font-medium text-slate-700">
                   Data do Registro
                 </label>
                 <Input
                   id="recordDate"
                   type="date"
                   value={newEntry.recordDate}
                   onChange={(e) => setNewEntry({ ...newEntry, recordDate: e.target.value })}
                   className="h-12 text-lg border-2 border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 text-slate-900 font-medium"
                 />
               </div>
               <div className="space-y-3">
                 <label htmlFor="notes" className="text-sm font-medium text-slate-700">
                   Observações (Opcional)
                 </label>
                 <Input
                   id="notes"
                   type="text"
                   placeholder="Ex: Semana de alta volatilidade"
                   value={newEntry.notes}
                   onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                   className="h-12 text-lg border-2 border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-600 text-slate-900 font-medium"
                 />
               </div>
             </div>
             <div className="flex justify-end mt-6">
               <Button 
                 onClick={addRecord}
                 disabled={!newEntry.poolLiquidity || !newEntry.gridBot || !newEntry.recordDate}
                 className={`px-8 py-3 text-lg font-semibold shadow-xl transition-all duration-300 transform hover:scale-105 border-0 ${
                   newEntry.poolLiquidity && newEntry.gridBot && newEntry.recordDate
                     ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white hover:shadow-2xl' 
                     : 'bg-gradient-to-r from-slate-400 to-slate-500 text-slate-200 cursor-not-allowed'
                 }`}
               >
                 <Plus className="h-5 w-5 mr-2" />
                 {newEntry.poolLiquidity && newEntry.gridBot && newEntry.recordDate ? 'Adicionar Registro' : 'Preencha os campos obrigatórios'}
               </Button>
             </div>
           </CardContent>
                   </Card>

         {/* Status do Banco de Dados */}
        <div className="flex justify-center">
          <DatabaseStatus />
        </div>

        {/* Links de Navegação */}
        <div className="flex justify-center space-x-4">
          <Link href="/historico">
            <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300 text-slate-700 hover:text-slate-900 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              <BarChart3 className="h-5 w-5 mr-2" />
              Ver Histórico Completo
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              <User className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
