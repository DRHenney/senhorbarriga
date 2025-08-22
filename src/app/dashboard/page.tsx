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
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Função para formatar valores monetários
const formatCurrency = (value: number): string => {
  const numValue = Number(value);
  if (isNaN(numValue) || numValue === 0) return '$0.00';
  
  if (numValue < 0.01) {
    return `$${numValue.toFixed(6)}`;
  } else if (numValue < 1) {
    return `$${numValue.toFixed(4)}`;
  } else {
    return `$${numValue.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
};

// Função para formatar preços
const formatPrice = (price: number): string => {
  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice === 0) return '$0.00';
  
  if (numPrice < 0.0001) {
    return `$${numPrice.toFixed(8)}`;
  } else if (numPrice < 0.01) {
    return `$${numPrice.toFixed(6)}`;
  } else if (numPrice < 1) {
    return `$${numPrice.toFixed(4)}`;
  } else if (numPrice < 1000) {
    return `$${numPrice.toFixed(2)}`;
  } else {
    return `$${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

// Função para formatar quantidade de tokens
const formatTokenAmount = (amount: number): string => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount === 0) return '0.00';
  
  if (numAmount < 0.000001) {
    return numAmount.toFixed(8);
  } else if (numAmount < 0.01) {
    return numAmount.toFixed(6);
  } else if (numAmount < 1) {
    return numAmount.toFixed(4);
  } else if (numAmount < 1000) {
    return numAmount.toFixed(2);
  } else {
    return numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

// Dados para o gráfico de barras
const getBarChartData = (records: any[]) => {
  if (records.length === 0) {
    return [];
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const weeklyData = records.reduce((acc: any, record) => {
    const date = new Date(record.recordDate);
    
    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
      const dateKey = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          week: dateKey,
          poolLiquidity: 0,
          gridBot: 0,
          total: 0,
          date: date
        };
      }
      
      acc[dateKey].poolLiquidity += record.poolLiquidity;
      acc[dateKey].gridBot += record.gridBot;
      acc[dateKey].total += record.total;
    }
    
    return acc;
  }, {});

  const sortedData = Object.values(weeklyData)
    .sort((a: any, b: any) => a.date - b.date)
    .map((item: any) => ({
      week: item.week,
      poolLiquidity: item.poolLiquidity,
      gridBot: item.gridBot,
      total: item.total
    }));

  return sortedData;
};

// Dados para o gráfico de pizza
const getPieData = (poolLiquidity: number, gridBot: number) => [
  { name: "Pool Liquidez", value: poolLiquidity, color: "#475569" },
  { name: "Grid Bot", value: gridBot, color: "#64748b" },
];

// Função para calcular dados mensais
const getMonthlyData = (records: any[]) => {
  if (records.length === 0) {
    return [];
  }

  const monthlyData = records.reduce((acc: any, record) => {
    const date = new Date(record.recordDate);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        poolLiquidity: 0,
        gridBot: 0,
        total: 0,
        date: date
      };
    }
    
    acc[monthKey].poolLiquidity += record.poolLiquidity;
    acc[monthKey].gridBot += record.gridBot;
    acc[monthKey].total += record.total;
    
    return acc;
  }, {});

  return Object.values(monthlyData)
    .sort((a: any, b: any) => a.date - b.date)
    .map((item: any) => ({
      name: item.name,
      poolLiquidity: item.poolLiquidity,
      gridBot: item.gridBot,
      total: item.total
    }));
};

// Componente de Tooltip Customizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-4 min-w-[200px]">
        <div className="mb-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {label}
          </p>
        </div>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {entry.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [showAddOperation, setShowAddOperation] = useState(false);
  const [newOperation, setNewOperation] = useState({
    type: "pool",
    pair: "",
    capital: "",
    startDate: "",
    rangeMin: "",
    rangeMax: "",
    numGrids: "",
    notes: ""
  });
  const [editingOperation, setEditingOperation] = useState<any>(null);
  const [operations, setOperations] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Dados mockados para demonstração
  const mockOperations = [
    {
      id: 1,
      type: "pool",
      pair: "USDT / USDE",
      capital: 85100,
      startDate: "2025-08-21",
      rangeMin: 0.95,
      rangeMax: 1.05,
      numGrids: 10,
      notes: "Operação de pool de liquidez",
      isActive: true
    }
  ];

  const mockRecords = [
    {
      id: 1,
      recordDate: "2025-08-22",
      poolLiquidity: 260,
      gridBot: 2738,
      total: 2998
    }
  ];

  const mockTokens = [
    {
      id: 1,
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.5,
      price: 45000,
      realTimePrice: 45500,
      priceChange24h: 2.5
    }
  ];

  useEffect(() => {
    setMounted(true);
    setOperations(mockOperations);
    setRecords(mockRecords);
    setTokens(mockTokens);
  }, []);

  const addOperation = async () => {
    if (newOperation.pair && newOperation.capital && newOperation.startDate) {
      const capital = parseFloat(newOperation.capital);
      const operation = {
        id: Date.now(),
        ...newOperation,
        capital,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      setOperations([...operations, operation]);
      setNewOperation({
        type: "pool",
        pair: "",
        capital: "",
        startDate: "",
        rangeMin: "",
        rangeMax: "",
        numGrids: "",
        notes: ""
      });
      setShowAddOperation(false);
      
      toast({
        title: "Operação adicionada!",
        description: `Operação ${operation.type} para ${operation.pair} foi criada com sucesso.`,
      });
    }
  };

  const editOperation = (operation: any) => {
    setEditingOperation(operation);
    setNewOperation({
      type: operation.type,
      pair: operation.pair,
      capital: operation.capital.toString(),
      startDate: operation.startDate,
      rangeMin: operation.rangeMin?.toString() || "",
      rangeMax: operation.rangeMax?.toString() || "",
      numGrids: operation.numGrids?.toString() || "",
      notes: operation.notes || ""
    });
    setShowAddOperation(true);
  };

  const updateOperation = () => {
    if (editingOperation && newOperation.pair && newOperation.capital && newOperation.startDate) {
      const capital = parseFloat(newOperation.capital);
      const updatedOperations = operations.map(op => 
        op.id === editingOperation.id 
          ? { ...op, ...newOperation, capital }
          : op
      );
      
      setOperations(updatedOperations);
      setEditingOperation(null);
      setNewOperation({
        type: "pool",
        pair: "",
        capital: "",
        startDate: "",
        rangeMin: "",
        rangeMax: "",
        numGrids: "",
        notes: ""
      });
      setShowAddOperation(false);
      
      toast({
        title: "Operação atualizada!",
        description: "A operação foi atualizada com sucesso.",
      });
    }
  };

  const removeOperation = (id: number) => {
    setOperations(operations.filter(op => op.id !== id));
    toast({
      title: "Operação removida!",
      description: "A operação foi removida com sucesso.",
    });
  };

  if (!mounted) {
    return null;
  }

  // Cálculos para os gráficos
  const barChartData = getBarChartData(records);
  const monthlyData = getMonthlyData(records);
  const totalPortfolioValue = operations.reduce((sum, op) => sum + op.capital, 0);
  const poolLiquidity = operations.filter(op => op.type === "pool").reduce((sum, op) => sum + op.capital, 0);
  const gridBot = operations.filter(op => op.type === "grid").reduce((sum, op) => sum + op.capital, 0);
  const pieData = getPieData(poolLiquidity, gridBot);
  const totalMonthlyValue = monthlyData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Senhor Barriga DeFi
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Dashboard de Finanças Pessoais
              </p>
            </div>
          </div>
          <UserNav />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-slate-100">
                      Dashboard Completo
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Gerencie suas operações de DeFi
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddOperation(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Operação
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Coins className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Portfolio Total</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                          {formatCurrency(totalPortfolioValue)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">Pool Liquidez</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
                          {formatCurrency(poolLiquidity)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Grid Bot</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                          {formatCurrency(gridBot)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("current")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === "current"
                          ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Operações Ativas
                    </button>
                    <button
                      onClick={() => setActiveTab("historical")}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === "historical"
                          ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      Histórico
                    </button>
                  </div>

                  {/* Content based on active tab */}
                  {activeTab === "current" ? (
                    <div className="space-y-4">
                      {operations.length === 0 ? (
                        <div className="text-center py-8">
                          <Coins className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                            Nenhuma operação ativa
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Comece adicionando sua primeira operação de DeFi
                          </p>
                          <Button 
                            onClick={() => setShowAddOperation(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Primeira Operação
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {operations.map((operation) => (
                            <Card key={operation.id} className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                      {operation.type === "pool" ? (
                                        <Coins className="w-5 h-5 text-blue-600" />
                                      ) : (
                                        <Target className="w-5 h-5 text-purple-600" />
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                        {operation.pair}
                                      </h3>
                                      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                                        {operation.type === "pool" ? "Pool de Liquidez" : "Grid Bot"}
                                      </p>
                                      {operation.type === "grid" && operation.rangeMin && operation.rangeMax && operation.numGrids && (
                                        <p className="text-xs text-slate-500 dark:text-slate-500">
                                          Range: ${operation.rangeMin.toLocaleString()} - ${operation.rangeMax.toLocaleString()} | {operation.numGrids} grids
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                      <p className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(Number(operation.capital))}</p>
                                      <p className="text-sm text-slate-500 dark:text-slate-500">
                                        Início: {new Date(operation.startDate).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => editOperation(operation)}
                                        className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-200"
                                      >
                                        Editar
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOperation(operation.id)}
                                        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart 
                        data={monthlyData}
                        style={{
                          background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '1px solid hsl(var(--border))',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        <CartesianGrid 
                          vertical={false} 
                          stroke="hsl(var(--border))" 
                          strokeDasharray="3 3"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          stroke="#6b7280"
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          stroke="#6b7280"
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="poolLiquidity" fill="#3b82f6" radius={4} name="Pool de Liquidez" />
                        <Bar dataKey="gridBot" fill="#6b7280" radius={4} name="Grid Bot" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm border-t border-slate-200">
                {activeTab === "current" ? (
                  <>
                    <div className="flex gap-2 leading-none font-medium text-slate-700 dark:text-slate-300">
                      Pool de Liquidez: {formatCurrency(pieData[0].value)} ({((pieData[0].value / totalPortfolioValue) * 100).toFixed(0)}%)
                    </div>
                    <div className="flex gap-2 leading-none font-medium text-slate-700 dark:text-slate-300">
                      Grid Bot: {formatCurrency(pieData[1].value)} ({((pieData[1].value / totalPortfolioValue) * 100).toFixed(0)}%)
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 leading-none font-medium text-slate-700 dark:text-slate-300">
                      Total Acumulado: {formatCurrency(totalMonthlyValue)} em {monthlyData.length} meses
                    </div>
                    <div className="flex gap-2 leading-none font-medium text-slate-700 dark:text-slate-300">
                      Crescimento: {((monthlyData[monthlyData.length - 1].total - monthlyData[0].total) / monthlyData[0].total * 100).toFixed(1)}% no período <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                      Média mensal: {formatCurrency(totalMonthlyValue / monthlyData.length)}
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <DatabaseStatus />
            
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Links Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/historico" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Histórico de Operações
                  </Button>
                </Link>
                <Link href="/auth/signin" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Gerenciar Conta
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add/Edit Operation Modal */}
        {showAddOperation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  {editingOperation ? "Editar Operação" : "Adicionar Operação"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={newOperation.type === "pool" ? "default" : "outline"}
                    onClick={() => setNewOperation({...newOperation, type: "pool"})}
                    className="w-full"
                  >
                    Pool de Liquidez
                  </Button>
                  <Button
                    variant={newOperation.type === "grid" ? "default" : "outline"}
                    onClick={() => setNewOperation({...newOperation, type: "grid"})}
                    className="w-full"
                  >
                    Grid Bot
                  </Button>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Par de Trading</label>
                  <Input
                    value={newOperation.pair}
                    onChange={(e) => setNewOperation({...newOperation, pair: e.target.value})}
                    placeholder="ex: BTC/USDT"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Capital</label>
                  <Input
                    type="number"
                    value={newOperation.capital}
                    onChange={(e) => setNewOperation({...newOperation, capital: e.target.value})}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início</label>
                  <Input
                    type="date"
                    value={newOperation.startDate}
                    onChange={(e) => setNewOperation({...newOperation, startDate: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                {newOperation.type === "grid" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Range Mínimo</label>
                        <Input
                          type="number"
                          value={newOperation.rangeMin}
                          onChange={(e) => setNewOperation({...newOperation, rangeMin: e.target.value})}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Range Máximo</label>
                        <Input
                          type="number"
                          value={newOperation.rangeMax}
                          onChange={(e) => setNewOperation({...newOperation, rangeMax: e.target.value})}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número de Grids</label>
                      <Input
                        type="number"
                        value={newOperation.numGrids}
                        onChange={(e) => setNewOperation({...newOperation, numGrids: e.target.value})}
                        placeholder="10"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notas</label>
                  <Input
                    value={newOperation.notes}
                    onChange={(e) => setNewOperation({...newOperation, notes: e.target.value})}
                    placeholder="Observações sobre a operação"
                    className="mt-1"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddOperation(false);
                    setEditingOperation(null);
                    setNewOperation({
                      type: "pool",
                      pair: "",
                      capital: "",
                      startDate: "",
                      rangeMin: "",
                      rangeMax: "",
                      numGrids: "",
                      notes: ""
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingOperation ? updateOperation : addOperation}
                  disabled={!newOperation.pair || !newOperation.capital || !newOperation.startDate}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingOperation ? "Atualizar" : "Adicionar"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
