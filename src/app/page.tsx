"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Plus, TrendingUp, DollarSign, Activity, CheckCircle, BarChart3, Target, Zap } from "lucide-react";
import Link from "next/link";

// Dados de exemplo
const chartData = [
  { week: "Semana 1", poolLiquidity: 5000, gridBot: 1200, total: 6200 },
  { week: "Semana 2", poolLiquidity: 5200, gridBot: 1350, total: 6550 },
  { week: "Semana 3", poolLiquidity: 5400, gridBot: 1400, total: 6800 },
  { week: "Semana 4", poolLiquidity: 5600, gridBot: 1500, total: 7100 },
  { week: "Semana 5", poolLiquidity: 5800, gridBot: 1600, total: 7400 },
];

const pieData = [
  { name: "Pool Liquidez", value: 5800, color: "#3b82f6" },
  { name: "Grid Bot", value: 1600, color: "#10b981" },
];

export default function Home() {
  const [newEntry, setNewEntry] = useState({
    poolLiquidity: "",
    gridBot: "",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold">Dashboard Financeiro</h1>
              </div>
              <p className="text-blue-100 text-lg">Acompanhe suas finanças de forma inteligente</p>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm font-medium">Deploy Automático Ativo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Cards de Resumo com design melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-600 font-medium">+12.5% este mês</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pool de Liquidez</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(poolLiquidity)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-600 font-medium">+8.2% esta semana</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Grid Bot</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(gridBot)}</div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-600 font-medium">+15.3% esta semana</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos com design melhorado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-800">Evolução ao Longo do Tempo</CardTitle>
              <CardDescription className="text-gray-600">Progresso semanal dos investimentos</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-800">Distribuição Atual</CardTitle>
              <CardDescription className="text-gray-600">Proporção entre pool de liquidez e grid bot</CardDescription>
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
                      border: '1px solid #e5e7eb',
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
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">Adicionar Nova Entrada Semanal</CardTitle>
            <CardDescription className="text-gray-600">Registre seus valores de pool de liquidez e grid bot</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="poolLiquidity" className="text-sm font-medium text-gray-700">
                  Pool de Liquidez ($)
                </label>
                <Input
                  id="poolLiquidity"
                  type="number"
                  placeholder="0.00"
                  value={newEntry.poolLiquidity}
                  onChange={(e) => setNewEntry({ ...newEntry, poolLiquidity: e.target.value })}
                  className="h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="gridBot" className="text-sm font-medium text-gray-700">
                  Grid Bot ($)
                </label>
                <Input
                  id="gridBot"
                  type="number"
                  placeholder="0.00"
                  value={newEntry.gridBot}
                  onChange={(e) => setNewEntry({ ...newEntry, gridBot: e.target.value })}
                  className="h-12 text-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Entrada
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link para Histórico com design melhorado */}
        <div className="flex justify-center">
          <Link href="/historico">
            <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 text-gray-700 hover:text-gray-900 px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300">
              Ver Histórico Completo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
