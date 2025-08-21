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





// Dados para o gráfico de barras (serão calculados dinamicamente)
const getBarChartData = (records: any[]) => {
  if (records.length === 0) {
    // Dados padrão quando não há registros - apenas 4 semanas do mês atual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return [
      { week: new Date(currentYear, currentMonth, 1).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }), poolLiquidity: 5000, gridBot: 1200, total: 6200 },
      { week: new Date(currentYear, currentMonth, 8).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }), poolLiquidity: 5200, gridBot: 1350, total: 6550 },
      { week: new Date(currentYear, currentMonth, 15).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }), poolLiquidity: 5400, gridBot: 1400, total: 6800 },
      { week: new Date(currentYear, currentMonth, 22).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }), poolLiquidity: 5600, gridBot: 1500, total: 7100 },
    ];
  }

  // Obter o mês e ano atual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Agrupar registros por data, mas apenas do mês atual
  const weeklyData = records.reduce((acc: any, record) => {
    const date = new Date(record.recordDate);
    
    // Filtrar apenas registros do mês atual
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

  // Converter para array e ordenar por data
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

// Dados para o gráfico de pizza (serão calculados dinamicamente)
const getPieData = (poolLiquidity: number, gridBot: number) => [
  { name: "Pool Liquidez", value: poolLiquidity, color: "#475569" },
  { name: "Grid Bot", value: gridBot, color: "#64748b" },
];



// Função para calcular dados mensais baseados nos registros
const getMonthlyData = (records: any[]) => {
  if (records.length === 0) {
    // Dados padrão quando não há registros
    return [
      { name: "Janeiro", poolLiquidity: 4800, gridBot: 1100, total: 5900 },
      { name: "Fevereiro", poolLiquidity: 5200, gridBot: 1250, total: 6450 },
      { name: "Março", poolLiquidity: 5400, gridBot: 1350, total: 6750 },
      { name: "Abril", poolLiquidity: 5600, gridBot: 1450, total: 7050 },
      { name: "Maio", poolLiquidity: 5800, gridBot: 1550, total: 7350 },
      { name: "Junho", poolLiquidity: 6000, gridBot: 1650, total: 7650 },
    ];
  }

  // Agrupar registros por mês
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

  // Converter para array e ordenar por data
  const sortedData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.date - b.date)
    .slice(-6) // Pegar apenas os últimos 6 meses
    .map((item: any) => ({
      name: item.name,
      poolLiquidity: item.poolLiquidity,
      gridBot: item.gridBot,
      total: item.total
    }));

  return sortedData;
};



// Dados de exemplo para tokens (serão carregados do banco)
const initialTokens: Array<{
  id: number;
  name: string;
  symbol: string;
  amount: number;
  price: number;
  value: number;
  purchaseDate: string;
}> = [];

// Função para calcular dados de evolução do portfólio baseados nos registros reais
const getPortfolioEvolutionData = (records: any[], tokens: any[]) => {
  // Calcular valor total dos tokens
  const tokensTotal = tokens.reduce((sum, token) => sum + (token.value || 0), 0);

  // Agrupar registros por mês
  const monthlyData = records.reduce((acc: any, record) => {
    const date = new Date(record.recordDate);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthName,
        value: 0,
        date: date,
        records: []
      };
    }
    
    acc[monthKey].value += record.total;
    acc[monthKey].records.push(record);
    
    return acc;
  }, {});

  // Converter para array e ordenar por data
  const sortedData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.date - b.date)
    .map((item: any) => ({
      month: item.month,
      value: item.value,
      date: item.date
    }));

  // Sempre criar array completo desde janeiro de 2025
  const startDate = new Date(2025, 0, 1); // Janeiro de 2025
  const currentDate = new Date();
  const allMonths = [];
  
  for (let d = new Date(startDate); d <= currentDate; d.setMonth(d.getMonth() + 1)) {
    const monthName = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    
    // Verificar se há dados reais para este mês
    const realData = sortedData.find((item: any) => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === d.getFullYear() && itemDate.getMonth() === d.getMonth();
    });
    
    if (realData) {
      // Usar dados reais
      allMonths.push({
        month: monthName,
        value: realData.value,
        date: new Date(d)
      });
    } else {
      // Usar dados históricos de exemplo para meses sem registros
      const historicalData = {
        "Jan/25": 28000,
        "Fev/25": 29500,
        "Mar/25": 31200,
        "Abr/25": 29800,
        "Mai/25": 32500,
        "Jun/25": 34100,
        "Jul/25": 35800,
        "Ago/25": 37200,
        "Set/25": 38500,
        "Out/25": 39800,
        "Nov/25": 41200,
        "Dez/25": 42500
      };
      
      allMonths.push({
        month: monthName,
        value: historicalData[monthName as keyof typeof historicalData] || 0,
        date: new Date(d)
      });
    }
  }
  
  // Adicionar tokens apenas ao último mês com dados reais (se não for zero)
  if (allMonths.length > 0) {
    const lastIndex = allMonths.length - 1;
    const lastItem = allMonths[lastIndex] as any;
    
    // Verificar se o último mês tem dados reais (não históricos)
    const lastMonthKey = `${lastItem.date.getFullYear()}-${lastItem.date.getMonth()}`;
    const hasRealData = sortedData.some((item: any) => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === lastItem.date.getFullYear() && 
             itemDate.getMonth() === lastItem.date.getMonth();
    });
    
    // Só adicionar tokens se há dados reais no último mês
    if (hasRealData && lastItem.value > 0) {
      allMonths[lastIndex] = {
        month: lastItem.month,
        value: lastItem.value + tokensTotal,
        date: lastItem.date
      };
    }
  }
  
  return allMonths;
};



// Função para formatar valores com precisão adequada
const formatValue = (value: number) => {
  if (value < 0.01) {
    return Number(value.toFixed(8));
  } else if (value < 1) {
    return Number(value.toFixed(6));
  } else {
    return Number(value.toFixed(4));
  }
};

// Função para formatar preços de forma inteligente
const formatPrice = (price: number): string => {
  if (price === 0) return '$0.00';
  
  if (price < 0.0001) {
    // Para valores muito pequenos, mostrar mais casas decimais
    return `$${price.toFixed(8)}`;
  } else if (price < 0.01) {
    // Para valores pequenos, mostrar 6 casas decimais
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    // Para valores menores que 1, mostrar 4 casas decimais
    return `$${price.toFixed(4)}`;
  } else if (price < 1000) {
    // Para valores normais, mostrar 2 casas decimais
    return `$${price.toFixed(2)}`;
  } else {
    // Para valores grandes, usar separadores de milhares
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

// Função para formatar valores monetários com separadores de milhares
const formatCurrency = (value: number): string => {
  if (value === 0) return '$0.00';
  
  if (value < 0.01) {
    // Para valores muito pequenos, mostrar mais precisão
    return `$${value.toFixed(6)}`;
  } else if (value < 1) {
    // Para valores pequenos, mostrar 4 casas decimais
    return `$${value.toFixed(4)}`;
  } else {
    // Para valores normais e grandes, usar separadores de milhares
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

// Função para formatar quantidade de tokens
const formatTokenAmount = (amount: number): string => {
  if (amount === 0) return '0.00';
  
  if (amount < 0.000001) {
    // Para quantidades muito pequenas
    return amount.toFixed(8);
  } else if (amount < 0.01) {
    // Para quantidades pequenas
    return amount.toFixed(6);
  } else if (amount < 1) {
    // Para quantidades menores que 1
    return amount.toFixed(4);
  } else if (amount < 1000) {
    // Para quantidades normais
    return amount.toFixed(2);
  } else {
    // Para quantidades grandes, usar separadores de milhares
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

// Função para formatar data
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Data inválida';
  }
};

// Função para calcular valor atual e lucro/prejuízo
const calculateTokenMetrics = (token: any) => {
  const currentPrice = token.realTimePrice || token.price || 0;
  const entryPrice = token.price || 0;
  const amount = token.amount || 0;
  
  // Valor atual baseado no preço em tempo real
  const currentValue = amount * currentPrice;
  
  // Valor de entrada
  const entryValue = amount * entryPrice;
  
  // Lucro/prejuízo
  const profitLoss = currentValue - entryValue;
  const profitLossPercentage = entryValue > 0 ? (profitLoss / entryValue) * 100 : 0;
  
  return {
    currentValue,
    entryValue,
    profitLoss,
    profitLossPercentage,
    currentPrice,
    entryPrice
  };
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
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
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
    purchaseDate: string;
    realTimePrice?: number;
    priceChange24h?: number;
    lastUpdated?: string;
    imageUrl?: string;
  }>>(initialTokens);
  const [activeTab, setActiveTab] = useState("current"); // "current" ou "monthly"
  const [evolutionTab, setEvolutionTab] = useState("weekly"); // "weekly" ou "records"
  const [newToken, setNewToken] = useState({
    name: "",
    symbol: "",
    amount: "",
    price: "",
    purchaseDate: new Date().toISOString().split('T')[0], // Data atual como padrão
  });
  
  const [priceInputType, setPriceInputType] = useState<'perToken' | 'totalValue'>('perToken');

  // Estado para edição de tokens
  const [editingToken, setEditingToken] = useState<{
    id: number;
    name: string;
    symbol: string;
    amount: number;
    price: number;
  } | null>(null);

  // Estado para edição rápida do preço
  const [editingPrice, setEditingPrice] = useState<{
    id: number;
    symbol: string;
    currentPrice: number;
    newPrice: string;
  } | null>(null);

  // Hook para notificações toast
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    action: "add" as "add" | "remove",
    amount: "",
    price: "",
  });

  // Estados para preços em tempo real
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string | null>(null);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);
  
  // Estados para o temporizador de atualização
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [nextUpdateTime, setNextUpdateTime] = useState<Date | null>(null);

  // Estados para operações ativas
  const [activeOperations, setActiveOperations] = useState<Array<{
    id: number;
    type: "pool" | "grid";
    pair: string;
    capital: number;
    startDate: string;
    rangeMin?: number;
    rangeMax?: number;
    numGrids?: number;
    notes?: string;
  }>>([]);

  const [newOperation, setNewOperation] = useState({
    type: "pool" as "pool" | "grid",
    pair: "",
    capital: "",
    startDate: new Date().toISOString().split('T')[0],
    rangeMin: "",
    rangeMax: "",
    numGrids: "",
    notes: "",
  });

  const [editingOperation, setEditingOperation] = useState<{
    id: number;
    type: "pool" | "grid";
    pair: string;
    capital: number;
    startDate: string;
    rangeMin?: number;
    rangeMax?: number;
    numGrids?: number;
    notes?: string;
  } | null>(null);

  // Verificar se os campos obrigatórios estão preenchidos (nome e símbolo)
  const isFormComplete = newToken.name && newToken.symbol;

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

  // Função para iniciar edição rápida do preço
  const startPriceEdit = (token: any) => {
    setEditingPrice({
      id: token.id,
      symbol: token.symbol,
      currentPrice: token.price,
      newPrice: token.price.toString()
    });
  };

  // Função para cancelar edição do preço
  const cancelPriceEdit = () => {
    setEditingPrice(null);
  };

  // Função para aplicar edição do preço
  const applyPriceEdit = async () => {
    if (!editingPrice || !editingPrice.newPrice) return;

    const newPrice = parseFloat(editingPrice.newPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({
        title: "⚠️ Aviso",
        description: "Por favor, insira um preço válido.",
        variant: "destructive",
      });
      return;
    }

    const currentToken = tokens.find(t => t.id === editingPrice.id);
    if (!currentToken) return;

    const newValue = currentToken.amount * newPrice;
    
    // Mostrar confirmação
    const confirmMessage = `Alterar preço de entrada do ${currentToken.symbol}?\n\n` +
                `Preço atual: ${formatPrice(currentToken.price)}\n` +
          `Novo preço: ${formatPrice(newPrice)}\n` +
      `Valor total: ${formatCurrency(currentToken.value)} → ${formatCurrency(newValue)}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    const updatedToken = {
      ...currentToken,
      price: formatValue(newPrice),
      value: formatValue(newValue)
    };

    // Atualizar no banco de dados
    try {
      const response = await fetch('/api/tokens', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingPrice.id,
          amount: updatedToken.amount,
          price: updatedToken.price,
          value: updatedToken.value,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTokens(tokens.map(t => t.id === editingPrice.id ? updatedToken : t));
        setEditingPrice(null);
        
        toast({
          title: "✅ Sucesso!",
          description: `Preço de entrada do ${currentToken.symbol} atualizado!`,
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        toast({
          title: "❌ Erro",
          description: `Erro ao atualizar preço: ${data.message}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar preço",
        variant: "destructive",
      });
    }
  };

  // Função para aplicar edição
  const applyEdit = async () => {
    if (!editingToken || !editForm.amount) return;

    const editAmount = parseFloat(editForm.amount);
    if (isNaN(editAmount) || editAmount <= 0) {
      toast({
        title: "⚠️ Aviso",
        description: "Por favor, insira uma quantidade válida maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const currentToken = tokens.find(t => t.id === editingToken.id);
    if (!currentToken) return;

    let updatedToken;
    if (editForm.action === "add") {
      // Adicionar tokens com preço médio
      const editPrice = editForm.price ? parseFloat(editForm.price) : currentToken.price;
      
      if (isNaN(editPrice) || editPrice <= 0) {
        toast({
          title: "⚠️ Aviso",
          description: "Por favor, insira um preço válido maior que zero.",
          variant: "destructive",
        });
        return;
      }

      // Calcular preço médio ponderado
      const currentValue = currentToken.amount * currentToken.price;
      const newValue = editAmount * editPrice;
      const totalValue = currentValue + newValue;
      const totalAmount = currentToken.amount + editAmount;
      const averagePrice = totalValue / totalAmount;

      const newAmount = formatValue(totalAmount);
      const newPrice = formatValue(averagePrice);
      const finalValue = formatValue(newAmount * newPrice);
      
      // Mostrar resumo da operação
              const confirmMessage = `Adicionar ${formatTokenAmount(editAmount)} ${currentToken.symbol} por ${formatPrice(editPrice)}?\n\n` +
          `Resultado: ${formatTokenAmount(currentToken.amount)} → ${formatTokenAmount(newAmount)} ${currentToken.symbol}\n` +
          `Preço médio: ${formatPrice(currentToken.price)} → ${formatPrice(newPrice)}\n` +
        `Valor total: ${formatCurrency(currentToken.value)} → ${formatCurrency(finalValue)}`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
      updatedToken = {
        ...currentToken,
        amount: newAmount,
        price: newPrice,
        value: finalValue,
      };
    } else {
      // Remover tokens (mantém o preço atual)
      if (editAmount > currentToken.amount) {
        toast({
          title: "⚠️ Aviso",
          description: `Você possui apenas ${formatTokenAmount(currentToken.amount)} ${currentToken.symbol}. Não é possível remover ${formatTokenAmount(editAmount)} ${currentToken.symbol}.`,
          variant: "destructive",
        });
        return;
      }
      
      if (editAmount === currentToken.amount) {
        // Se está removendo tudo, perguntar se quer deletar o token
        if (confirm(`Você está removendo todos os ${formatTokenAmount(currentToken.amount)} ${currentToken.symbol}. Deseja remover completamente este token do portfólio?`)) {
          await removeToken(currentToken.id);
          return;
        } else {
          return;
        }
      }
      
      const newAmount = formatValue(currentToken.amount - editAmount);
      const newValue = formatValue(newAmount * currentToken.price);
      
      // Mostrar resumo da operação
              const confirmMessage = `Remover ${formatTokenAmount(editAmount)} ${currentToken.symbol}?\n\n` +
          `Resultado: ${formatTokenAmount(currentToken.amount)} → ${formatTokenAmount(newAmount)} ${currentToken.symbol}\n` +
          `Preço médio: ${formatPrice(currentToken.price)} (mantido)\n` +
        `Valor total: ${formatCurrency(currentToken.value)} → ${formatCurrency(newValue)}`;
      
      if (!confirm(confirmMessage)) {
        return;
      }
      
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
        
        const actionText = editForm.action === "add" ? "adicionados" : "removidos";
        const symbol = currentToken.symbol || 'tokens';
        toast({
          title: "✅ Sucesso!",
          description: `${formatTokenAmount(editAmount)} ${symbol} ${actionText} com sucesso!`,
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        toast({
          title: "❌ Erro",
          description: `Erro ao atualizar token: ${data.message}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar token",
        variant: "destructive",
      });
    }
  };



  // Calcular dados dinâmicos baseados nos registros
  const barChartData = getBarChartData(records);
  const lastBarData = barChartData.length > 0 ? barChartData[barChartData.length - 1] : null;
  
  // Calcular valor total do mês atual (soma de todas as entradas do mês)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const totalValue = records
    .filter(record => {
      const recordDate = new Date(record.recordDate);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    })
    .reduce((sum, record) => {
      const poolValue = record.poolLiquidity || 0;
      const gridValue = record.gridBot || 0;
      return sum + poolValue + gridValue;
    }, 0);
  const poolLiquidity = lastBarData?.poolLiquidity || 0;
  const gridBot = lastBarData?.gridBot || 0;
  
  // Calcular dados dinâmicos para o gráfico de pizza
  const pieData = getPieData(poolLiquidity, gridBot);
  
  // Calcular dados mensais dinâmicos
  const monthlyData = getMonthlyData(records);
  const totalMonthlyValue = monthlyData.reduce((sum, month) => sum + month.total, 0);

  // Calcular valor total do portfólio de tokens
  const portfolioTotal = tokens.reduce((sum, token) => {
    const tokenValue = token.value || 0;
    return sum + (isNaN(tokenValue) ? 0 : tokenValue);
  }, 0);

  // Calcular dados de evolução do portfólio
  const portfolioEvolutionData = getPortfolioEvolutionData(records, tokens);
  
  // Calcular valor total de todos os registros (soma acumulada)
  const totalRecordsValue = records.reduce((sum, record) => {
    const poolValue = record.poolLiquidity || 0;
    const gridValue = record.gridBot || 0;
    return sum + poolValue + gridValue;
  }, 0);
  
  // Calcular valor total geral: registros acumulados + tokens
  const totalPortfolioValue = totalRecordsValue + portfolioTotal;
  
  // Calcular crescimento percentual
  let portfolioGrowth = "0.0";
  if (portfolioEvolutionData.length > 1) {
    const firstValue = (portfolioEvolutionData[0] as any).value;
    const lastValue = (portfolioEvolutionData[portfolioEvolutionData.length - 1] as any).value;
    portfolioGrowth = (((lastValue - firstValue) / firstValue) * 100).toFixed(1);
  }





  // Função para buscar preços em tempo real
  const fetchRealTimePrices = async (tokensList: any[], showLoading = false) => {
    console.log('🔄 fetchRealTimePrices chamada:', {
      tokensListLength: tokensList.length,
      isFetchingPrices,
      showLoading
    });
    
    if (tokensList.length === 0 || isFetchingPrices) {
      console.log('❌ fetchRealTimePrices cancelada:', {
        tokensListLength: tokensList.length,
        isFetchingPrices
      });
      return;
    }

    console.log('🔄 fetchRealTimePrices iniciando, definindo isFetchingPrices = true');
    setIsFetchingPrices(true);

    try {
      console.log('🔄 Atualizando preços automaticamente para:', tokensList.map(t => t.symbol));
      
      const tokensToFetch = tokensList.map(token => ({ symbol: token.symbol }));
      console.log('🌐 Fazendo fetch para /api/prices/coingecko...');

      const response = await fetch('/api/prices/coingecko', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens: tokensToFetch }),
        cache: 'no-store'
      });

      console.log('📥 Resposta recebida da API:', response.status, response.statusText);

      if (!response.ok) {
        console.error('❌ Erro na API:', response.status, response.statusText);
        return;
      }

      console.log('📥 Fazendo parse da resposta JSON...');
      const data = await response.json();
      console.log('📥 Parse JSON concluído, verificando dados...');

      if (data.success && data.results) {
        const updatedTokens = tokensList.map(token => {
          const priceData = data.results.find((p: any) => p.symbol === token.symbol);
          if (priceData && priceData.success) {
            console.log(`✅ ${token.symbol}: $${priceData.data.priceUsd} (${priceData.data.priceChange24h > 0 ? '+' : ''}${priceData.data.priceChange24h.toFixed(2)}%)`);
            return {
              ...token,
              realTimePrice: priceData.data.priceUsd,
              priceChange24h: priceData.data.priceChange24h,
              imageUrl: priceData.data.imageUrl || token.imageUrl, // Salvar URL da imagem
              lastUpdated: new Date().toLocaleString('pt-BR')
            };
          }
          return token;
        });

        // Só atualizar se realmente houve mudanças
        const hasChanges = updatedTokens.some((token, index) => {
          const originalToken = tokensList[index];
          return token.realTimePrice !== originalToken.realTimePrice ||
                 token.priceChange24h !== originalToken.priceChange24h;
        });

        if (hasChanges) {
          console.log('🔄 Atualizando tokens no estado:', updatedTokens.map(t => ({ symbol: t.symbol, realTimePrice: t.realTimePrice })));
          setTokens(updatedTokens);
          setLastPriceUpdate(new Date().toLocaleString('pt-BR'));
          // Reset do temporizador para próxima atualização
          setNextUpdateTime(new Date(Date.now() + 30000));
        } else {
          console.log('📊 Nenhuma mudança detectada nos preços');
        }
        
        const successCount = data.results.filter((p: any) => p.success).length;
        console.log(`📈 Atualização automática concluída: ${successCount}/${data.results.length} tokens`);
      } else {
        console.error('❌ Resposta da API inválida:', data);
      }
    } catch (error) {
      console.error('❌ Erro na atualização automática:', error);
    } finally {
      console.log('🔄 fetchRealTimePrices terminando, definindo isFetchingPrices = false');
      setIsFetchingPrices(false);
    }

    // Timeout de segurança para garantir que isFetchingPrices seja resetado
    setTimeout(() => {
      if (isFetchingPrices) {
        console.log('⚠️ Timeout de segurança: forçando isFetchingPrices = false');
        setIsFetchingPrices(false);
      }
    }, 10000); // 10 segundos
  };

  // Função para iniciar atualização automática
  const startAutoUpdate = () => {
    console.log('🔄 startAutoUpdate chamada:', { 
      tokensLength: tokens.length, 
      isLoadingTokens, 
      isFetchingPrices,
      autoUpdateInterval: !!autoUpdateInterval 
    });
    
    if (tokens.length > 0 && !isLoadingTokens && !isFetchingPrices) {
      console.log('✅ Condições atendidas, iniciando fetchRealTimePrices...');
      fetchRealTimePrices(tokens, false);
    } else {
      console.log('❌ Condições não atendidas para atualização automática:', {
        tokensLength: tokens.length,
        isLoadingTokens,
        isFetchingPrices
      });
    }
  };



  // Carregar tokens do banco
  const loadTokens = async () => {
    console.log('📥 loadTokens iniciado');
    if (isLoadingTokens) {
      console.log('⏳ loadTokens já em andamento, cancelando...');
      return; // Evitar carregamentos simultâneos
    }
    
    setIsLoadingTokens(true);
    try {
      console.log('🌐 Fazendo fetch para /api/tokens...');
      const response = await fetch('/api/tokens');
      const data = await response.json();
      
      console.log('📥 Resposta da API tokens:', { success: data.success, tokensCount: data.tokens?.length });
      
      if (data.success && Array.isArray(data.tokens)) {
        // Converter os valores string para number e corrigir casas decimais
        const processedTokens = data.tokens.map((token: any) => {
          // Verificar se o token tem todas as propriedades necessárias
          if (!token || typeof token !== 'object') {
            console.warn('Token inválido encontrado:', token);
            return null;
          }

          // Garantir que todas as propriedades existam
          const safeToken = {
            id: token.id || 0,
            name: token.name || 'Token',
            symbol: token.symbol || 'N/A',
            amount: parseFloat(token.amount || '0'),
            price: parseFloat(token.price || '0'),
            value: parseFloat(token.value || '0'),
            purchaseDate: token.purchaseDate || token.createdAt || new Date().toISOString(),
          };

          const amount = safeToken.amount;
          const price = safeToken.price;
          const value = safeToken.value;
          
          // Verificar se os valores são válidos
          if (isNaN(amount) || isNaN(price) || isNaN(value)) {
            console.warn('Valores inválidos no token:', token);
            return {
              ...safeToken,
              amount: 0,
              price: 0,
              value: 0
            };
          }
          
          // Manter precisão adequada para valores fracionários
          // Para preços muito pequenos (< $0.01), manter até 8 casas decimais
          // Para preços normais, manter até 4 casas decimais
          const formatPrice = (price: number) => {
            if (price < 0.01) {
              return Number(price.toFixed(8));
            } else if (price < 1) {
              return Number(price.toFixed(6));
            } else {
              return Number(price.toFixed(4));
            }
          };

          // Para quantidades, manter até 8 casas decimais se necessário
          const formatAmount = (amount: number) => {
            if (amount.toString().includes('.') && amount.toString().split('.')[1]?.length > 8) {
              return Number(amount.toFixed(8));
            }
            return amount;
          };

          return {
            ...safeToken,
            amount: formatAmount(amount),
            price: formatPrice(price),
            value: formatValue(value)
          };
        }).filter((token: any) => token !== null); // Remover tokens inválidos
        
        console.log('✅ Tokens processados e definidos no estado:', processedTokens.length);
        setTokens(processedTokens);
        
        // Fazer primeira atualização imediata se há tokens
        if (processedTokens.length > 0) {
          console.log('🚀 Primeira atualização imediata...');
          console.log('📋 Tokens para primeira atualização:', processedTokens.map((t: any) => t.symbol));
          // Executar imediatamente
          fetchRealTimePrices(processedTokens, false);
        } else {
          console.log('📭 Nenhum token para buscar preços');
        }
      } else {
        console.warn('Resposta inválida da API de tokens:', data);
        setTokens([]);
      }
    } catch (error) {
      console.error('Erro ao carregar tokens:', error);
      setTokens([]);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  // useEffect para carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.allSettled([
          loadTokens(),
          loadRecords(),
          loadOperations()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "❌ Erro",
          description: "Erro ao carregar dados",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect para gerenciar atualização automática de preços
  useEffect(() => {
    console.log('🔄 useEffect de atualização automática executado:', { 
      tokensLength: tokens.length, 
      autoUpdateInterval: !!autoUpdateInterval,
      tokensIds: tokens.map(t => t.id)
    });
    
    // Limpar intervalo anterior se existir
    if (autoUpdateInterval) {
      console.log('🧹 Limpando intervalo anterior');
      clearInterval(autoUpdateInterval);
      setAutoUpdateInterval(null);
    }

    // Aguardar um pouco antes de desativar se não há tokens
    if (tokens.length === 0) {
      const timeout = setTimeout(() => {
        if (tokens.length === 0) {
          console.log('📭 Nenhum token encontrado após timeout, desativando atualização automática');
          setAutoUpdateInterval(null);
          setNextUpdateTime(null);
        }
      }, 3000); // Aguardar 3 segundos

      return () => clearTimeout(timeout);
    }

    // Só iniciar atualização automática se houver tokens
    if (tokens.length > 0) {
      console.log('🚀 Iniciando atualização automática para', tokens.length, 'tokens');
      
      // Iniciar atualização automática
      const interval = setInterval(() => {
        console.log('⏰ Executando atualização automática...');
        fetchRealTimePrices(tokens, false);
      }, 30000); // 30 segundos

      console.log('✅ Intervalo criado:', interval);
      setAutoUpdateInterval(interval);
      setNextUpdateTime(new Date(Date.now() + 30000));
      console.log('✅ Estados atualizados - autoUpdateInterval e nextUpdateTime definidos');
      console.log('✅ Intervalo configurado - próximas atualizações a cada 30 segundos');

      // Cleanup ao desmontar componente
      return () => {
        console.log('🧹 Limpando intervalo de atualização automática');
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      console.log('📭 Nenhum token para atualização automática');
    }
  }, [tokens.length, tokens]); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect para gerenciar o countdown
  useEffect(() => {
    console.log('⏱️ useEffect countdown executado:', { 
      nextUpdateTime: nextUpdateTime?.toISOString(), 
      tokensLength: tokens.length,
      countdownSeconds 
    });

    if (!nextUpdateTime || tokens.length === 0) {
      console.log('⏱️ Countdown desativado - sem nextUpdateTime ou tokens');
      setCountdownSeconds(30);
      return;
    }

    console.log('⏱️ Iniciando countdown...');
    const countdownInterval = setInterval(() => {
      const now = new Date();
      const timeLeft = Math.max(0, Math.ceil((nextUpdateTime.getTime() - now.getTime()) / 1000));
      
      console.log('⏱️ Countdown:', timeLeft, 'segundos restantes');
      
      if (timeLeft === 0) {
        // Reset para próxima atualização
        console.log('⏱️ Countdown zerado, resetando...');
        setNextUpdateTime(new Date(Date.now() + 30000));
        setCountdownSeconds(30);
      } else {
        setCountdownSeconds(timeLeft);
      }
    }, 1000);

    return () => {
      console.log('⏱️ Limpando countdown interval');
      clearInterval(countdownInterval);
    };
  }, [nextUpdateTime, tokens.length]);

  // Carregar registros do banco
  const loadRecords = async () => {
    try {
      const response = await fetch('/api/records');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.records)) {
        setRecords(data.records);
      } else {
        console.warn('Resposta inválida da API de registros:', data);
        setRecords([]);
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      setRecords([]);
    }
  };

  // Carregar operações do banco
  const loadOperations = async () => {
    try {
      console.log('🔄 Carregando operações do banco de dados...');
      const response = await fetch('/api/operations');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.operations)) {
        console.log('✅ Operações carregadas:', data.operations.length);
        setActiveOperations(data.operations);
      } else {
        console.warn('Resposta inválida da API de operações:', data);
        setActiveOperations([]);
      }
    } catch (error) {
      console.error('Erro ao carregar operações:', error);
      setActiveOperations([]);
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
          toast({
            title: "✅ Sucesso!",
            description: "Registro adicionado com sucesso!",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
          });
        } else {
          toast({
            title: "❌ Erro",
            description: `Erro ao adicionar registro: ${data.message}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "❌ Erro",
          description: "Erro ao adicionar registro",
          variant: "destructive",
        });
      }
    }
  };

  // Editar registro
  const editRecord = (record: any) => {
    console.log('✏️ Editando registro:', record);
    setEditingRecord({
      id: record.id,
      poolLiquidity: record.poolLiquidity || 0,
      gridBot: record.gridBot || 0,
      recordDate: record.recordDate ? record.recordDate.split('T')[0] : new Date().toISOString().split('T')[0],
      notes: record.notes || "",
    });
  };

  // Aplicar edição de registro
  const applyRecordEdit = async () => {
    if (!editingRecord) return;

    console.log('🔄 Aplicando edição de registro:', editingRecord);

    // Encontrar o registro original para usar valores padrão
    const originalRecord = records.find(r => r.id === editingRecord.id);
    if (!originalRecord) {
      toast({
        title: "❌ Erro",
        description: "Registro original não encontrado",
        variant: "destructive",
      });
      return;
    }

    // Usar valores editados ou manter os originais
    const finalData = {
      id: editingRecord.id,
      poolLiquidity: editingRecord.poolLiquidity || originalRecord.poolLiquidity,
      gridBot: editingRecord.gridBot || originalRecord.gridBot,
      recordDate: editingRecord.recordDate || originalRecord.recordDate.split('T')[0],
      notes: editingRecord.notes !== undefined ? editingRecord.notes : (originalRecord.notes || ""),
    };

    console.log('📤 Dados finais para envio:', finalData);

    try {
      const response = await fetch('/api/records', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRecords(records.map(r => r.id === editingRecord.id ? data.record : r));
        setEditingRecord(null);
        toast({
          title: "✅ Sucesso!",
          description: "Registro atualizado com sucesso!",
          variant: "default",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        toast({
          title: "❌ Erro",
          description: `Erro ao atualizar registro: ${data.message}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao atualizar registro",
        variant: "destructive",
      });
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
          toast({
            title: "✅ Sucesso!",
            description: "Registro removido com sucesso!",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
          });
        } else {
          toast({
            title: "❌ Erro",
            description: `Erro ao remover registro: ${data.message}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "❌ Erro",
          description: "Erro ao remover registro",
          variant: "destructive",
        });
      }
    }
  };

  // Adicionar novo token
  const addToken = async () => {
    if (newToken.name && newToken.symbol) {
      try {
        console.log('🚀 Iniciando adição de token:', newToken);
        
        // Se quantidade e preço não foram fornecidos, usar valores padrão
        const amount = newToken.amount ? parseFloat(newToken.amount) : 0;
        let price = newToken.price ? parseFloat(newToken.price) : 0;
        
        // Validar valores se foram fornecidos
        if (newToken.amount && (isNaN(amount) || amount < 0)) {
          toast({
            title: "⚠️ Aviso",
            description: "Por favor, insira um valor válido para quantidade.",
            variant: "destructive",
          });
          return;
        }

        if (newToken.price && (isNaN(price) || price < 0)) {
          toast({
            title: "⚠️ Aviso",
            description: "Por favor, insira um valor válido para preço.",
            variant: "destructive",
          });
          return;
        }

        // Se o usuário escolheu "Valor Total", calcular o preço por token
        if (priceInputType === 'totalValue' && price > 0 && amount > 0) {
          price = price / amount; // Calcular preço por token
          console.log(`💰 Calculando preço por token: ${newToken.price} / ${amount} = ${price}`);
        }

        const tokenData = {
          ...newToken,
          amount: formatValue(amount),
          price: formatValue(price),
          value: formatValue(amount * price),
          purchaseDate: newToken.purchaseDate,
        };

        console.log('📤 Enviando dados do token:', tokenData);

        const response = await fetch('/api/tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tokenData),
        });
        
        console.log('📥 Resposta da API:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📥 Dados da resposta:', data);
        
        if (data.success) {
          console.log('✅ Token adicionado com sucesso! Token retornado:', data.token);
          console.log('📋 Tokens atuais:', tokens);
          
          // Processar o token retornado para garantir que tenha todas as propriedades
          const newTokenData = Array.isArray(data.token) ? data.token[0] : data.token;
          const processedToken = {
            id: newTokenData.id || 0,
            name: newTokenData.name || 'Token',
            symbol: newTokenData.symbol || 'N/A',
            amount: parseFloat(newTokenData.amount || '0'),
            price: parseFloat(newTokenData.price || '0'),
            value: parseFloat(newTokenData.value || '0'),
            purchaseDate: newTokenData.purchaseDate || new Date().toISOString(),
          };
          
          console.log('📋 Token processado:', processedToken);
          console.log('📋 Novo array de tokens:', [...tokens, processedToken]);
          
          setTokens([...tokens, processedToken]);
          setNewToken({ name: "", symbol: "", amount: "", price: "", purchaseDate: new Date().toISOString().split('T')[0] });
          
          console.log('✅ Estado atualizado, mostrando toast...');
          toast({
            title: "✅ Sucesso!",
            description: "Token adicionado com sucesso!",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
          });
          console.log('✅ Toast exibido com sucesso!');
        } else {
          console.error('❌ Erro na API:', data);
          toast({
            title: "❌ Erro",
            description: `Erro ao adicionar token: ${data.message}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('❌ Erro na requisição:', error);
        console.error('❌ Tipo do erro:', typeof error);
        console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
        
        toast({
          title: "❌ Erro",
          description: "Erro ao adicionar token",
          variant: "destructive",
        });
      }
    }
  };

  // Remover token
  const removeToken = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este token?')) {
      try {
        const response = await fetch(`/api/tokens?id=${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTokens(tokens.filter(token => token.id !== id));
          toast({
            title: "✅ Sucesso!",
            description: "Token removido com sucesso!",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
          });
        } else {
          toast({
            title: "❌ Erro",
            description: `Erro ao remover token: ${data.message}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "❌ Erro",
          description: "Erro ao remover token",
          variant: "destructive",
        });
      }
    }
  };

  // Funções para operações ativas
  const addOperation = async () => {
    if (newOperation.pair && newOperation.capital && newOperation.startDate) {
      const capital = parseFloat(newOperation.capital);
      
      if (isNaN(capital) || capital <= 0) {
        toast({
          title: "⚠️ Aviso",
          description: "Por favor, insira um valor válido para o capital.",
          variant: "destructive",
        });
        return;
      }

      // Validações específicas para grid bots
      if (newOperation.type === "grid") {
        const rangeMin = parseFloat(newOperation.rangeMin);
        const rangeMax = parseFloat(newOperation.rangeMax);
        const numGrids = parseInt(newOperation.numGrids);
        
        if (isNaN(rangeMin) || isNaN(rangeMax) || isNaN(numGrids) || 
            rangeMin <= 0 || rangeMax <= 0 || numGrids <= 0) {
          toast({
            title: "⚠️ Aviso",
            description: "Para grid bots, preencha range mínimo, máximo e número de grids.",
            variant: "destructive",
          });
          return;
        }
        
        if (rangeMin >= rangeMax) {
          toast({
            title: "⚠️ Aviso",
            description: "O range mínimo deve ser menor que o máximo.",
            variant: "destructive",
          });
          return;
        }
      }

      try {
        console.log('🔄 Salvando operação no banco de dados...');
        
        const response = await fetch('/api/operations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: newOperation.type,
            pair: newOperation.pair,
            capital: capital,
            startDate: newOperation.startDate,
            rangeMin: newOperation.type === "grid" ? parseFloat(newOperation.rangeMin) : undefined,
            rangeMax: newOperation.type === "grid" ? parseFloat(newOperation.rangeMax) : undefined,
            numGrids: newOperation.type === "grid" ? parseInt(newOperation.numGrids) : undefined,
            notes: newOperation.notes || undefined,
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log('✅ Operação salva com sucesso:', data.operation);
          
          // Adicionar à lista local
          setActiveOperations([...activeOperations, data.operation]);
          
          // Limpar formulário
          setNewOperation({
            type: "pool",
            pair: "",
            capital: "",
            startDate: new Date().toISOString().split('T')[0],
            rangeMin: "",
            rangeMax: "",
            numGrids: "",
            notes: "",
          });
          
          toast({
            title: "✅ Sucesso!",
            description: "Operação adicionada e salva no banco de dados!",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
          });
        } else {
          console.error('❌ Erro ao salvar operação:', data.message);
          toast({
            title: "❌ Erro",
            description: `Erro ao salvar operação: ${data.message}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('❌ Erro na requisição:', error);
        toast({
          title: "❌ Erro",
          description: "Erro ao salvar operação no banco de dados",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "⚠️ Aviso",
        description: "Por favor, preencha os campos obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const editOperation = (operation: any) => {
    setEditingOperation({
      id: operation.id,
      type: operation.type,
      pair: operation.pair,
      capital: operation.capital,
      startDate: operation.startDate,
      rangeMin: operation.rangeMin,
      rangeMax: operation.rangeMax,
      numGrids: operation.numGrids,
      notes: operation.notes,
    });
  };

  const applyOperationEdit = () => {
    if (!editingOperation) return;

    const capital = editingOperation.capital;
    
    if (isNaN(capital) || capital <= 0) {
      toast({
        title: "⚠️ Aviso",
        description: "Por favor, insira um valor válido para o capital.",
        variant: "destructive",
      });
      return;
    }

    // Validações específicas para grid bots
    if (editingOperation.type === "grid") {
      const rangeMin = editingOperation.rangeMin;
      const rangeMax = editingOperation.rangeMax;
      const numGrids = editingOperation.numGrids;
      
      if (!rangeMin || !rangeMax || !numGrids || 
          rangeMin <= 0 || rangeMax <= 0 || numGrids <= 0) {
        toast({
          title: "⚠️ Aviso",
          description: "Para grid bots, preencha range mínimo, máximo e número de grids.",
          variant: "destructive",
        });
        return;
      }
      
      if (rangeMin >= rangeMax) {
        toast({
          title: "⚠️ Aviso",
          description: "O range mínimo deve ser menor que o máximo.",
          variant: "destructive",
        });
        return;
      }
    }

    setActiveOperations(activeOperations.map(op => 
      op.id === editingOperation.id ? editingOperation : op
    ));
    setEditingOperation(null);
    toast({
      title: "✅ Sucesso!",
      description: "Operação atualizada com sucesso!",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const removeOperation = (id: number) => {
    if (confirm('Tem certeza que deseja remover esta operação?')) {
      setActiveOperations(activeOperations.filter(op => op.id !== id));
      toast({
        title: "✅ Sucesso!",
        description: "Operação removida com sucesso!",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }
  };

  // Função para obter cores baseadas no tema
  const getChartColors = () => {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      poolLiquidity: isDark ? '#3b82f6' : '#1e40af', // Azul mais profundo
      gridBot: isDark ? '#64748b' : '#475569', // Cinza mais sofisticado
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header com gradiente Slate */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black text-white shadow-lg">
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
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black text-white border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col h-full">
                {/* Header do Card */}
                <div className="mb-6">
                  <h3 className="text-slate-300 text-sm font-medium mb-2">Portfólio Total</h3>
                  <div className="text-3xl font-bold text-white mb-2">{formatCurrency(totalPortfolioValue)}</div>
                </div>
                
                                 {/* Gráfico de Linha */}
                 <div className="flex-1">
                   <ResponsiveContainer width="100%" height={200}>
                     <LineChart data={portfolioEvolutionData}>
                       <CartesianGrid vertical={false} stroke="#334155" strokeDasharray="3 3" />
                       <XAxis
                         dataKey="month"
                         tickLine={false}
                         tickMargin={10}
                         axisLine={false}
                         stroke="#64748b"
                         fontSize={12}
                       />
                       <YAxis
                         tickLine={false}
                         tickMargin={10}
                         axisLine={false}
                         stroke="#64748b"
                         fontSize={12}
                         tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                       />
                       <Tooltip content={<CustomTooltip />} />
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
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Resumo Rápido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">DeFi Total:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Tokens:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(portfolioTotal)}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 dark:text-slate-200 font-medium">Total Geral:</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalPortfolioValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Resumo com design melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Valor Total</CardTitle>
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalValue)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-600 font-medium">
                  {(() => {
                    // Calcular valor do mês anterior para comparação
                    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                    
                    const previousMonthValue = records
                      .filter(record => {
                        const recordDate = new Date(record.recordDate);
                        return recordDate.getMonth() === previousMonth && recordDate.getFullYear() === previousYear;
                      })
                      .reduce((sum, record) => {
                        const poolValue = record.poolLiquidity || 0;
                        const gridValue = record.gridBot || 0;
                        return sum + poolValue + gridValue;
                      }, 0);
                    
                    if (previousMonthValue > 0 && totalValue > 0) {
                      const growth = ((totalValue - previousMonthValue) / previousMonthValue * 100).toFixed(1);
                      return `${parseFloat(growth) > 0 ? '+' : ''}${growth}% este mês`;
                    }
                    return 'Primeiro mês de registro';
                  })()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Pool de Liquidez</CardTitle>
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <Target className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(poolLiquidity)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">+8.2% esta semana</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Grid Bot</CardTitle>
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <Zap className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(gridBot)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">+15.3% esta semana</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Portfólio Tokens</CardTitle>
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <Coins className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(portfolioTotal)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{tokens.length} tokens</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Portfólio de Tokens */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl border-slate-200 dark:border-slate-700">
          <CardHeader className="border-b border-slate-200 dark:border-slate-600">
            <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">Portfólio de Tokens</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Gerencie seus tokens e acompanhe o valor total do portfólio</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Formulário para adicionar token */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Nome do Token
                </label>
                <Input
                  placeholder="Ex: Bitcoin"
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Símbolo
                </label>
                <Input
                  placeholder="Ex: BTC"
                  value={newToken.symbol}
                  onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium uppercase"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Quantidade
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newToken.amount}
                  onChange={(e) => setNewToken({ ...newToken, amount: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  {priceInputType === 'perToken' ? 'Preço por Token ($)' : 'Valor Total ($)'}
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder={priceInputType === 'perToken' ? "0.00" : "0.00"}
                    value={newToken.price}
                    onChange={(e) => setNewToken({ ...newToken, price: e.target.value })}
                    className="h-12 text-base border-2 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={priceInputType === 'perToken' ? "default" : "outline"}
                      onClick={() => setPriceInputType('perToken')}
                      className={`text-xs px-3 py-1 ${
                        priceInputType === 'perToken' 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                          : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      Por Token
                    </Button>
                    <Button
                      size="sm"
                      variant={priceInputType === 'totalValue' ? "default" : "outline"}
                      onClick={() => setPriceInputType('totalValue')}
                      className={`text-xs px-3 py-1 ${
                        priceInputType === 'totalValue' 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                          : 'border-orange-300 text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      Valor Total
                    </Button>
                  </div>
                  {priceInputType === 'totalValue' && newToken.price && newToken.amount && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                      💡 Preço por token será calculado automaticamente: ${newToken.price} ÷ {newToken.amount} = {formatPrice(parseFloat(newToken.price) / parseFloat(newToken.amount))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Data da Compra
                </label>
                <Input
                  type="date"
                  value={newToken.purchaseDate}
                  onChange={(e) => setNewToken({ ...newToken, purchaseDate: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 dark:border-slate-600 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
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
                {isFormComplete ? 'Adicionar Token' : 'Preencha nome e símbolo'}
              </Button>
            </div>

            {/* Header dos Tokens */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Seus Tokens</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    {lastPriceUpdate && (
                      <span>Última atualização: {lastPriceUpdate}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${autoUpdateInterval ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-500">
                      {autoUpdateInterval ? 'Atualização automática ativa' : 'Atualização automática inativa'}
                    </span>
                    {autoUpdateInterval && tokens.length > 0 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                        • {countdownSeconds}s
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log('🔧 Atualização manual solicitada');
                        fetchRealTimePrices(tokens, true);
                      }}
                      className="h-6 px-2 text-xs border-blue-300 text-blue-600 hover:bg-blue-50"
                      title="Atualizar preços manualmente"
                    >
                      🔄
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            {/* Lista de tokens */}
            <div className="space-y-3">
              {tokens.map((token) => (
                <div key={token.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  {editingToken?.id === token.id ? (
                    // Modo de edição
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                          {token.imageUrl ? (
                            <img 
                              src={token.imageUrl} 
                              alt={`${token.name} logo`}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                // Fallback para inicial se a imagem falhar
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={token.imageUrl ? 'hidden' : ''}>
                            {token.symbol && token.symbol.length > 0 ? token.symbol.charAt(0) : '?'}
                          </span>
                        </div>
                                                <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{token.name || 'Token'}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{token.symbol || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Quantidade atual: {token.amount > 0 ? `${formatTokenAmount(token.amount)} ${token.symbol || 'N/A'}` : `0.00 ${token.symbol || 'N/A'} (acompanhamento)`}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-500">
                            {token.price > 0 ? `Preço médio: ${formatPrice(token.price)}` : 'Preço não definido'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          <Button
                            variant={editForm.action === "add" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setEditForm({ ...editForm, action: "add" })}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            title="Adicionar mais tokens ao portfólio"
                          >
                            ➕ Adicionar
                          </Button>
                          <Button
                            variant={editForm.action === "remove" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setEditForm({ ...editForm, action: "remove" })}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            title="Remover uma parcela dos tokens (vendas parciais)"
                          >
                            ➖ Remover
                          </Button>
                        </div>
                        
                                                                         <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {editForm.action === "add" ? "Quantidade a adicionar (compras)" : "Quantidade a remover (vendas)"}
                          </label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="h-10 text-base border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
                          />
                        </div>
                         
                         {editForm.action === "add" && (
                           <div className="space-y-2">
                             <label className="text-sm font-medium text-slate-700">
                               Preço por token ($) - Opcional
                             </label>
                                                           <Input
                                type="number"
                                placeholder={`${formatPrice(token.price)} (preço atual)`}
                                value={editForm.price}
                                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                className="h-10 text-base border-2 border-slate-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 bg-white shadow-sm hover:border-slate-400 transition-all duration-200 placeholder:text-slate-500 text-slate-900 font-medium"
                              />
                             <p className="text-xs text-slate-500">
                               Deixe vazio para usar o preço atual. Se informado, será calculado o preço médio ponderado.
                             </p>
                           </div>
                         )}
                         
                         {editForm.action === "remove" && (
                           <div className="space-y-2">
                             <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                               <p className="text-xs text-blue-700 dark:text-blue-300">
                                 <strong>💡 Dica:</strong> Ao remover tokens, o preço médio permanece o mesmo. 
                                 Se você remover todos os tokens, será perguntado se deseja deletar o token do portfólio.
                               </p>
                             </div>
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
                          className={editForm.action === "add" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                        >
                          {editForm.action === "add" ? "✅ Adicionar Tokens" : "❌ Remover Tokens"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo de visualização - Nova apresentação leve
                    <div className="flex items-center justify-between">
                      {/* Lado esquerdo - Informações básicas */}
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                          {token.imageUrl ? (
                            <img 
                              src={token.imageUrl} 
                              alt={`${token.name} logo`}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                // Fallback para inicial se a imagem falhar
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={token.imageUrl ? 'hidden' : ''}>
                            {token.symbol && token.symbol.length > 0 ? token.symbol.charAt(0) : '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{token.name || 'Token'}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{token.symbol || 'N/A'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {token.amount > 0 ? `${formatTokenAmount(token.amount)} tokens` : '0.00 tokens (acompanhamento)'}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            Comprado em: {formatDate(token.purchaseDate)}
                          </p>
                        </div>
                      </div>

                      {/* Lado direito - Valores e lucro/prejuízo */}
                      <div className="flex items-center space-x-6">
                        {/* Preço atual e variação 24h */}
                        {token.realTimePrice ? (
                          <div className="text-right">
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {formatPrice(token.realTimePrice)}
                            </p>
                            {token.priceChange24h !== undefined && (
                              <p className={`text-sm font-medium ${
                                token.priceChange24h > 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : token.priceChange24h < 0 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-slate-500 dark:text-slate-400'
                              }`}>
                                {token.priceChange24h > 0 ? '↗' : token.priceChange24h < 0 ? '↘' : '→'} 
                                {Math.abs(token.priceChange24h).toFixed(2)}% (24h)
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-right">
                            <p className="text-sm text-slate-400 dark:text-slate-500">
                              ⏳ Aguardando...
                            </p>
                          </div>
                        )}

                        {/* Valor atual e lucro/prejuízo */}
                        {(() => {
                          const metrics = calculateTokenMetrics(token);
                          return (
                            <div className="text-right">
                              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {formatCurrency(metrics.currentValue)}
                              </p>
                              {metrics.entryValue > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-medium ${
                                    metrics.profitLoss > 0 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : metrics.profitLoss < 0 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {metrics.profitLoss > 0 ? '↗' : metrics.profitLoss < 0 ? '↘' : '→'} 
                                    {formatCurrency(Math.abs(metrics.profitLoss))}
                                  </span>
                                  <span className={`text-xs ${
                                    metrics.profitLossPercentage > 0 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : metrics.profitLossPercentage < 0 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-slate-500 dark:text-slate-400'
                                  }`}>
                                    ({metrics.profitLossPercentage > 0 ? '+' : ''}{metrics.profitLossPercentage.toFixed(2)}%)
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                                                 {/* Preço de entrada discreto */}
                         {editingPrice?.id === token.id ? (
                           // Modo de edição do preço
                           <div className="text-right">
                             <div className="flex items-center space-x-2">
                               <Input
                                 type="number"
                                 step="0.00000001"
                                 placeholder="0.00000000"
                                 value={editingPrice.newPrice}
                                 onChange={(e) => setEditingPrice({
                                   ...editingPrice,
                                   newPrice: e.target.value
                                 })}
                                 className="h-8 text-xs border-2 border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white dark:bg-slate-700"
                               />
                               <Button
                                 size="sm"
                                 onClick={applyPriceEdit}
                                 className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white text-xs"
                               >
                                 ✓
                               </Button>
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={cancelPriceEdit}
                                 className="h-8 px-2 border-red-300 text-red-600 hover:bg-red-50 text-xs"
                               >
                                 ✕
                               </Button>
                             </div>
                             <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                               Editando preço de entrada...
                             </p>
                           </div>
                         ) : (
                           // Modo de visualização do preço
                           <div className="text-right">
                             <div className="flex items-center space-x-1">
                               <p className="text-xs text-slate-500 dark:text-slate-500">
                                 {token.price > 0 ? `Entrada: ${formatPrice(token.price)}` : 'Preço não definido'}
                               </p>
                               {token.price > 0 && (
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   onClick={() => startPriceEdit(token)}
                                   className="h-4 w-4 p-0 text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                   title="Editar preço de entrada"
                                 >
                                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                   </svg>
                                 </Button>
                               )}
                             </div>
                             {token.price === 0 && (
                               <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                 Clique no ícone para definir o preço
                               </p>
                             )}
                           </div>
                         )}

                        {/* Botões de ação */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editToken(token)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-200"
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
            <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Valor Total do Portfólio</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {tokens.length} tokens • 
                    {lastPriceUpdate ? ` Preços atualizados: ${new Date(lastPriceUpdate).toLocaleTimeString('pt-BR')}` : ' Preços não atualizados'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(portfolioTotal)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {tokens.filter(t => t.realTimePrice).length > 0 ? 
                      `${tokens.filter(t => t.realTimePrice).length}/${tokens.length} tokens com preços em tempo real` : 
                      'Aguardando atualização automática de preços...'
                    }
                    {autoUpdateInterval && tokens.length > 0 && (
                      <span className="text-blue-600 dark:text-blue-400 font-mono ml-2">
                        • {countdownSeconds}s
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos com design melhorado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl border-slate-200 dark:border-slate-700">
            <CardHeader className="border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                                     <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                     {evolutionTab === "weekly" ? "Evolução Semanal" : "Registros Semanais"}
                   </CardTitle>
                   <CardDescription className="text-slate-600 dark:text-slate-400">
                    {evolutionTab === "weekly" 
                      ? "Valores de Pool de Liquidez e Grid Bot por semana" 
                      : "Histórico dos seus registros semanais"
                    }
                  </CardDescription>
                </div>
                                 <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                   <button
                     onClick={() => setEvolutionTab("weekly")}
                     className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                       evolutionTab === "weekly"
                         ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                         : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                     }`}
                   >
                     <BarChart3 className="h-4 w-4 inline mr-1" />
                     Semanal
                   </button>
                   <button
                     onClick={() => setEvolutionTab("records")}
                     className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                       evolutionTab === "records"
                         ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                         : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
                   <BarChart 
                     data={barChartData}
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
                       dataKey="week"
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
              ) : (
                                 <div className="space-y-4">
                   {records.length === 0 ? (
                     <div className="text-center py-8">
                       <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                               <p className="text-slate-600 dark:text-slate-400">Nenhum registro encontrado</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">Adicione registros semanais para ver o histórico</p>
                     </div>
                   ) : (
                     <div className="space-y-3 max-h-80 overflow-y-auto">
                       {records.slice(0, 10).map((record) => (
                         <div key={record.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                           {editingRecord?.id === record.id ? (
                             // Modo de edição
                             <div className="space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                 <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">Pool de Liquidez ($)</label>
                                                                       <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={editingRecord.poolLiquidity}
                                      onChange={(e) => setEditingRecord({ ...editingRecord, poolLiquidity: parseFloat(e.target.value) || 0 })}
                                      className="h-10 text-sm border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">Grid Bot ($)</label>
                                                                       <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={editingRecord.gridBot}
                                      onChange={(e) => setEditingRecord({ ...editingRecord, gridBot: parseFloat(e.target.value) || 0 })}
                                      className="h-10 text-sm border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">Data</label>
                                                                       <Input
                                      type="date"
                                      value={editingRecord.recordDate}
                                      onChange={(e) => setEditingRecord({ ...editingRecord, recordDate: e.target.value })}
                                      className="h-10 text-sm border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white text-slate-900 font-medium"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-sm font-medium text-slate-700">Observações</label>
                                                                       <Input
                                      type="text"
                                      placeholder="Opcional"
                                      value={editingRecord.notes || ""}
                                      onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                                      className="h-10 text-sm border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                    />
                                 </div>
                               </div>
                               <div className="flex justify-end space-x-2">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => setEditingRecord(null)}
                                   className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                 >
                                   Cancelar
                                 </Button>
                                 <Button
                                   size="sm"
                                   onClick={applyRecordEdit}
                                   className="bg-blue-600 hover:bg-blue-700 text-white"
                                 >
                                   Salvar
                                 </Button>
                               </div>
                             </div>
                           ) : (
                             // Modo de visualização
                             <div className="flex items-center justify-between">
                               <div className="flex items-center space-x-4">
                                 <div>
                                                                       <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                      {new Date(record.recordDate).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </p>
                                    {record.notes && (
                                      <p className="text-xs text-slate-500 dark:text-slate-500 italic">{record.notes}</p>
                                    )}
                                 </div>
                               </div>
                               <div className="flex items-center space-x-4">
                                                                   <div className="text-right">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Pool: {formatCurrency(record.poolLiquidity)}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Grid: {formatCurrency(record.gridBot)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(record.total)}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-500">Total</p>
                                  </div>
                                 <div className="flex space-x-2">
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => editRecord(record)}
                                     className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-200"
                                   >
                                     Editar
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => removeRecord(record.id)}
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
                   )}
                 </div>
              )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm border-t border-slate-200">
              {evolutionTab === "weekly" ? (
                <>
                                                                           <div className="flex gap-2 leading-none font-medium text-slate-700 dark:text-slate-300">
                      {barChartData.length > 1 ? (
                        <>
                          Crescimento de {((barChartData[barChartData.length - 1].poolLiquidity + barChartData[barChartData.length - 1].gridBot - barChartData[0].poolLiquidity - barChartData[0].gridBot) / (barChartData[0].poolLiquidity + barChartData[0].gridBot) * 100).toFixed(1)}% no período <TrendingUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          {records.length > 0 ? 'Dados baseados nos seus registros' : 'Dados de exemplo'} <TrendingUp className="h-4 w-4" />
                        </>
                      )}
                    </div>
                                      <div className="text-slate-600 dark:text-slate-400 leading-none">
                      {records.length > 0 
                        ? `Mostrando evolução baseada em ${records.length} registros (datas do mês atual)`
                        : 'Mostrando evolução dos investimentos (datas do mês atual - dados de exemplo)'
                      }
                    </div>
                </>
              ) : (
                <>
                                     <div className="flex gap-2 leading-none font-medium text-slate-700 dark:text-slate-300">
                     {records.length > 0 ? `${records.length} registros encontrados` : 'Nenhum registro'}
                   </div>
                   <div className="text-slate-600 dark:text-slate-400 leading-none">
                     Mostrando os últimos 10 registros semanais
                   </div>
                </>
              )}
            </CardFooter>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl border-slate-200 dark:border-slate-700">
            <CardHeader className="border-b border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    {activeTab === "current" ? "Operações Ativas" : "Resumo Mensal"}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {activeTab === "current" 
                      ? "Pools de liquidez e grid bots ativos" 
                      : "Acumulado dos últimos 6 meses"
                    }
                  </CardDescription>
                </div>
                <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("current")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "current"
                        ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <Target className="h-4 w-4 inline mr-1" />
                    Operações
                  </button>
                  <button
                    onClick={() => setActiveTab("monthly")}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "monthly"
                        ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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
                <div className="space-y-6">
                  {/* Formulário para adicionar operação */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Adicionar Nova Operação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                              <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                          <select
                            value={newOperation.type}
                            onChange={(e) => setNewOperation({ ...newOperation, type: e.target.value as "pool" | "grid" })}
                            className="w-full h-10 px-3 border-2 border-slate-300 dark:border-slate-600 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                          >
                          <option value="pool">🏊‍♂️ Pool de Liquidez</option>
                          <option value="grid">🤖 Grid Bot</option>
                        </select>
                      </div>
                                             <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Par</label>
                         <Input
                           placeholder="Ex: BTC/USDT"
                           value={newOperation.pair}
                           onChange={(e) => setNewOperation({ ...newOperation, pair: e.target.value })}
                           className="h-10 border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-500 dark:placeholder:text-slate-400"
                         />
                       </div>
                                             <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Capital ($)</label>
                         <Input
                           type="number"
                           placeholder="0.00"
                           value={newOperation.capital}
                           onChange={(e) => setNewOperation({ ...newOperation, capital: e.target.value })}
                           className="h-10 border-2 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-500 dark:placeholder:text-slate-400"
                         />
                       </div>
                                             <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início</label>
                         <Input
                           type="date"
                           value={newOperation.startDate}
                           onChange={(e) => setNewOperation({ ...newOperation, startDate: e.target.value })}
                           className="h-10 border-2 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                         />
                       </div>
                    </div>
                    
                    {newOperation.type === "grid" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                 <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Range Mínimo ($)</label>
                           <Input
                             type="number"
                             placeholder="0.00"
                             value={newOperation.rangeMin}
                             onChange={(e) => setNewOperation({ ...newOperation, rangeMin: e.target.value })}
                             className="h-10 border-2 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-500 dark:placeholder:text-slate-400"
                           />
                         </div>
                                                 <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Range Máximo ($)</label>
                           <Input
                             type="number"
                             placeholder="0.00"
                             value={newOperation.rangeMax}
                             onChange={(e) => setNewOperation({ ...newOperation, rangeMax: e.target.value })}
                             className="h-10 border-2 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-500 dark:placeholder:text-slate-400"
                           />
                         </div>
                                                 <div className="space-y-2">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Número de Grids</label>
                           <Input
                             type="number"
                             placeholder="0"
                             value={newOperation.numGrids}
                             onChange={(e) => setNewOperation({ ...newOperation, numGrids: e.target.value })}
                             className="h-10 border-2 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-500 dark:placeholder:text-slate-400"
                           />
                         </div>
                      </div>
                    )}
                    
                                         <div className="mt-4">
                       <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações (Opcional)</label>
                       <Input
                         placeholder="Ex: Pool de alta volatilidade"
                         value={newOperation.notes}
                         onChange={(e) => setNewOperation({ ...newOperation, notes: e.target.value })}
                         className="mt-1 h-10 border-2 border-slate-300 dark:border-slate-600 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-900/20 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-500 dark:placeholder:text-slate-400"
                       />
                     </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        onClick={addOperation}
                        disabled={!newOperation.pair || !newOperation.capital || !newOperation.startDate}
                        className={`px-6 py-2 text-base font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 border-0 ${
                          newOperation.pair && newOperation.capital && newOperation.startDate
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl' 
                            : 'bg-gradient-to-r from-slate-400 to-slate-500 text-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Operação
                      </Button>
                    </div>
                  </div>

                  {/* Lista de operações ativas */}
                  <div className="space-y-4">
                                         {activeOperations.length === 0 ? (
                       <div className="text-center py-8">
                         <Target className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                         <p className="text-slate-600 dark:text-slate-400">Nenhuma operação ativa</p>
                         <p className="text-sm text-slate-500 dark:text-slate-500">Adicione pools de liquidez ou grid bots para começar</p>
                       </div>
                    ) : (
                      <div className="space-y-3">
                                                 {activeOperations.map((operation) => (
                           <div key={operation.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            {editingOperation?.id === operation.id ? (
                              // Modo de edição
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tipo</label>
                                    <select
                                      value={editingOperation.type}
                                      onChange={(e) => setEditingOperation({ ...editingOperation, type: e.target.value as "pool" | "grid" })}
                                      className="w-full h-10 px-3 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-slate-900 font-medium"
                                    >
                                      <option value="pool">🏊‍♂️ Pool de Liquidez</option>
                                      <option value="grid">🤖 Grid Bot</option>
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Par</label>
                                    <Input
                                      placeholder="Ex: BTC/USDT"
                                      value={editingOperation.pair}
                                      onChange={(e) => setEditingOperation({ ...editingOperation, pair: e.target.value })}
                                      className="h-10 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Capital ($)</label>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      value={editingOperation.capital}
                                      onChange={(e) => setEditingOperation({ ...editingOperation, capital: parseFloat(e.target.value) || 0 })}
                                      className="h-10 border-2 border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Data de Início</label>
                                    <Input
                                      type="date"
                                      value={editingOperation.startDate}
                                      onChange={(e) => setEditingOperation({ ...editingOperation, startDate: e.target.value })}
                                      className="h-10 border-2 border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white text-slate-900 font-medium"
                                    />
                                  </div>
                                </div>
                                
                                {editingOperation.type === "grid" && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">Range Mínimo ($)</label>
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={editingOperation.rangeMin || ""}
                                        onChange={(e) => setEditingOperation({ ...editingOperation, rangeMin: parseFloat(e.target.value) || 0 })}
                                        className="h-10 border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">Range Máximo ($)</label>
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={editingOperation.rangeMax || ""}
                                        onChange={(e) => setEditingOperation({ ...editingOperation, rangeMax: parseFloat(e.target.value) || 0 })}
                                        className="h-10 border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium text-slate-700">Número de Grids</label>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        value={editingOperation.numGrids || ""}
                                        onChange={(e) => setEditingOperation({ ...editingOperation, numGrids: parseInt(e.target.value) || 0 })}
                                        className="h-10 border-2 border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-slate-700">Observações</label>
                                  <Input
                                    placeholder="Ex: Pool de alta volatilidade"
                                    value={editingOperation.notes || ""}
                                    onChange={(e) => setEditingOperation({ ...editingOperation, notes: e.target.value })}
                                    className="h-10 border-2 border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 bg-white text-slate-900 font-medium placeholder:text-slate-500"
                                  />
                                </div>
                                
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingOperation(null)}
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={applyOperationEdit}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Modo de visualização
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                    operation.type === "pool" 
                                      ? "bg-gradient-to-r from-blue-500 to-blue-600" 
                                      : "bg-gradient-to-r from-green-500 to-green-600"
                                  }`}>
                                    {operation.type === "pool" ? "🏊‍♂️" : "🤖"}
                                  </div>
                                                                     <div>
                                     <h3 className="font-semibold text-slate-900 dark:text-slate-100">{operation.pair}</h3>
                                     <p className="text-sm text-slate-600 dark:text-slate-400">
                                       {operation.type === "pool" ? "Pool de Liquidez" : "Grid Bot"}
                                       {operation.notes && ` • ${operation.notes}`}
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
                                     <p className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(operation.capital)}</p>
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
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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

                                   {/* Formulário com design melhorado */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl border-slate-200 dark:border-slate-700">
            <CardHeader className="border-b border-slate-200 dark:border-slate-600">
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">Adicionar Nova Entrada Semanal</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Registre seus valores de pool de liquidez e grid bot com data</CardDescription>
            </CardHeader>
           <CardContent className="pt-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                               <div className="space-y-3">
                  <label htmlFor="poolLiquidity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Pool de Liquidez ($)
                  </label>
                  <Input
                    id="poolLiquidity"
                    type="number"
                    placeholder="0.00"
                    value={newEntry.poolLiquidity}
                    onChange={(e) => setNewEntry({ ...newEntry, poolLiquidity: e.target.value })}
                    className="h-12 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                               <div className="space-y-3">
                  <label htmlFor="gridBot" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Grid Bot ($)
                  </label>
                  <Input
                    id="gridBot"
                    type="number"
                    placeholder="0.00"
                    value={newEntry.gridBot}
                    onChange={(e) => setNewEntry({ ...newEntry, gridBot: e.target.value })}
                    className="h-12 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                               <div className="space-y-3">
                  <label htmlFor="recordDate" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Data do Registro
                  </label>
                  <Input
                    id="recordDate"
                    type="date"
                    value={newEntry.recordDate}
                    onChange={(e) => setNewEntry({ ...newEntry, recordDate: e.target.value })}
                    className="h-12 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                               <div className="space-y-3">
                  <label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Observações (Opcional)
                  </label>
                  <Input
                    id="notes"
                    type="text"
                    placeholder="Ex: Semana de alta volatilidade"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    className="h-12 text-lg border-2 border-slate-300 dark:border-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
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
             <Button variant="outline" size="lg" className="bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
               <BarChart3 className="h-5 w-5 mr-2" />
               Ver Histórico Completo
             </Button>
           </Link>
           <Link href="/dashboard">
             <Button size="lg" className="bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 hover:from-slate-700 hover:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
               <User className="h-5 w-5 mr-2" />
               Dashboard
             </Button>
           </Link>
         </div>
      </div>
      <Toaster />
    </div>
  );
}
