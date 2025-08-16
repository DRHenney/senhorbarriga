"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Filter } from "lucide-react"
import Link from "next/link"

// Dados de exemplo para o histórico
const historicalData = [
  { 
    id: 1,
    date: "2024-01-15", 
    poolLiquidity: 1200, 
    gridBot: 800, 
    total: 2000,
    poolGrowth: 0,
    gridGrowth: 0,
    totalGrowth: 0
  },
  { 
    id: 2,
    date: "2024-01-22", 
    poolLiquidity: 1350, 
    gridBot: 950, 
    total: 2300,
    poolGrowth: 12.5,
    gridGrowth: 18.75,
    totalGrowth: 15
  },
  { 
    id: 3,
    date: "2024-01-29", 
    poolLiquidity: 1100, 
    gridBot: 1200, 
    total: 2300,
    poolGrowth: -18.5,
    gridGrowth: 26.3,
    totalGrowth: 0
  },
  { 
    id: 4,
    date: "2024-02-05", 
    poolLiquidity: 1600, 
    gridBot: 1100, 
    total: 2700,
    poolGrowth: 45.5,
    gridGrowth: -8.3,
    totalGrowth: 17.4
  },
  { 
    id: 5,
    date: "2024-02-12", 
    poolLiquidity: 1400, 
    gridBot: 1300, 
    total: 2700,
    poolGrowth: -12.5,
    gridGrowth: 18.2,
    totalGrowth: 0
  },
  { 
    id: 6,
    date: "2024-02-19", 
    poolLiquidity: 1800, 
    gridBot: 1400, 
    total: 3200,
    poolGrowth: 28.6,
    gridGrowth: 7.7,
    totalGrowth: 18.5
  },
]

export default function HistoricoPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    const color = value >= 0 ? 'text-green-600' : 'text-red-600'
    const sign = value >= 0 ? '+' : ''
    return <span className={color}>{sign}{value.toFixed(1)}%</span>
  }

  const totalInvested = historicalData.reduce((sum, item) => sum + item.total, 0)
  const averageWeeklyGrowth = historicalData
    .filter(item => item.totalGrowth !== 0)
    .reduce((sum, item) => sum + item.totalGrowth, 0) / 
    (historicalData.filter(item => item.totalGrowth !== 0).length || 1)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Histórico Detalhado
          </h1>
          <p className="text-muted-foreground">
            Visualize todos os registros e acompanhe a evolução dos seus investimentos
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-muted-foreground">
                Soma de todos os registros
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescimento Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageWeeklyGrowth.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Por semana (excluindo primeira semana)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{historicalData.length} semanas</div>
              <p className="text-xs text-muted-foreground">
                Desde {new Date(historicalData[0].date).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Histórico */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Histórico Completo</CardTitle>
                <CardDescription>
                  Todos os registros semanais com cálculos de crescimento
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Pool Liquidez</TableHead>
                  <TableHead className="text-right">Crescimento Pool</TableHead>
                  <TableHead className="text-right">Robô Grid</TableHead>
                  <TableHead className="text-right">Crescimento Grid</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Crescimento Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {new Date(row.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.poolLiquidity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercentage(row.poolGrowth)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.gridBot)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercentage(row.gridGrowth)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(row.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercentage(row.totalGrowth)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
