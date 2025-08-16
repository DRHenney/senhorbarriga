"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Plus, TrendingUp, DollarSign, Activity } from "lucide-react"

// Dados de exemplo para os gráficos
const weeklyData = [
  { week: "Semana 1", poolLiquidity: 1200, gridBot: 800, total: 2000 },
  { week: "Semana 2", poolLiquidity: 1350, gridBot: 950, total: 2300 },
  { week: "Semana 3", poolLiquidity: 1100, gridBot: 1200, total: 2300 },
  { week: "Semana 4", poolLiquidity: 1600, gridBot: 1100, total: 2700 },
  { week: "Semana 5", poolLiquidity: 1400, gridBot: 1300, total: 2700 },
  { week: "Semana 6", poolLiquidity: 1800, gridBot: 1400, total: 3200 },
]

const portfolioData = [
  { name: "Pool Liquidez", value: 1800, color: "#3b82f6" },
  { name: "Robô Grid", value: 1400, color: "#10b981" },
]

export default function Home() {
  const [newEntry, setNewEntry] = useState({
    poolLiquidity: "",
    gridBot: "",
    date: new Date().toISOString().split('T')[0]
  })

  const handleAddEntry = () => {
    // Aqui você implementaria a lógica para salvar os dados
    console.log("Novo registro:", newEntry)
    setNewEntry({
      poolLiquidity: "",
      gridBot: "",
      date: new Date().toISOString().split('T')[0]
    })
  }

  const totalValue = weeklyData[weeklyData.length - 1]?.total || 0
  const previousValue = weeklyData[weeklyData.length - 2]?.total || 0
  const growth = ((totalValue - previousValue) / previousValue * 100).toFixed(2)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Senhor Barriga - Dashboard Financeiro
              </h1>
              <p className="text-muted-foreground">
                Acompanhe seus investimentos em pools de liquidez e robôs de grid
              </p>
            </div>
            <Link href="/historico">
              <Button variant="outline">
                Ver Histórico
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$ {totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {growth}% em relação à semana anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Pool de Liquidez</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$ {weeklyData[weeklyData.length - 1]?.poolLiquidity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((weeklyData[weeklyData.length - 1]?.poolLiquidity / totalValue) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Robô Grid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$ {weeklyData[weeklyData.length - 1]?.gridBot.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((weeklyData[weeklyData.length - 1]?.gridBot / totalValue) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Semanal</CardTitle>
              <CardDescription>
                Acompanhe o crescimento do seu portfólio ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="poolLiquidity" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="gridBot" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição do Portfólio</CardTitle>
              <CardDescription>
                Composição atual dos seus investimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Formulário para Adicionar Dados */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Registro</CardTitle>
            <CardDescription>
              Insira os valores da semana atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data</label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Pool de Liquidez ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newEntry.poolLiquidity}
                  onChange={(e) => setNewEntry({ ...newEntry, poolLiquidity: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Robô Grid ($)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newEntry.gridBot}
                  onChange={(e) => setNewEntry({ ...newEntry, gridBot: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleAddEntry} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Registro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
