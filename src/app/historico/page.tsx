"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter } from "lucide-react";
import Link from "next/link";

// Dados históricos de exemplo
const historicalData = [
  {
    week: "Semana 1",
    date: "2024-01-01",
    poolLiquidity: 5000,
    gridBot: 1200,
    total: 6200,
    weeklyGrowth: 0,
    cumulativeGrowth: 0,
  },
  {
    week: "Semana 2",
    date: "2024-01-08",
    poolLiquidity: 5200,
    gridBot: 1350,
    total: 6550,
    weeklyGrowth: 5.6,
    cumulativeGrowth: 5.6,
  },
  {
    week: "Semana 3",
    date: "2024-01-15",
    poolLiquidity: 5400,
    gridBot: 1400,
    total: 6800,
    weeklyGrowth: 3.8,
    cumulativeGrowth: 9.7,
  },
  {
    week: "Semana 4",
    date: "2024-01-22",
    poolLiquidity: 5600,
    gridBot: 1500,
    total: 7100,
    weeklyGrowth: 4.4,
    cumulativeGrowth: 14.5,
  },
  {
    week: "Semana 5",
    date: "2024-01-29",
    poolLiquidity: 5800,
    gridBot: 1600,
    total: 7400,
    weeklyGrowth: 4.2,
    cumulativeGrowth: 19.4,
  },
];

// Funções de formatação
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// Cálculos dos resumos
const totalInvested = historicalData[0]?.total || 0;
const averageWeeklyGrowth = historicalData.reduce((acc, item) => acc + item.weeklyGrowth, 0) / (historicalData.length - 1);
const period = `${historicalData.length} semanas`;

export default function HistoricoPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Histórico Financeiro</h1>
              <p className="text-muted-foreground">Acompanhe o desempenho ao longo do tempo</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-muted-foreground">Valor inicial</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crescimento Semanal Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(averageWeeklyGrowth)}</div>
              <p className="text-xs text-muted-foreground">Média das últimas semanas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{period}</div>
              <p className="text-xs text-muted-foreground">Tempo de acompanhamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Dados */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Históricos</CardTitle>
            <CardDescription>
              Evolução semanal dos seus investimentos em pool de liquidez e grid bot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semana</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Pool Liquidez</TableHead>
                  <TableHead className="text-right">Grid Bot</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Crescimento Semanal</TableHead>
                  <TableHead className="text-right">Crescimento Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalData.map((row) => (
                  <TableRow key={row.week}>
                    <TableCell className="font-medium">{row.week}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.poolLiquidity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.gridBot)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(row.total)}</TableCell>
                    <TableCell className="text-right">
                      <span className={row.weeklyGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatPercentage(row.weeklyGrowth)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={row.cumulativeGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                        {formatPercentage(row.cumulativeGrowth)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
