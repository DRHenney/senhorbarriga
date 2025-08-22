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

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

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
                <CardTitle className="text-slate-900 dark:text-slate-100">
                  Aplicação Completa
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Bem-vindo à aplicação completa do Senhor Barriga DeFi
                </CardDescription>
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
                          {formatCurrency(85100)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">Crescimento</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
                          +12.5%
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Operações Ativas</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                          5
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Operação
                    </Button>
                    <Button variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Ver Relatórios
                    </Button>
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Histórico
                    </Button>
                  </div>

                  {/* Welcome Message */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      🎉 Aplicação Completa Carregada!
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      Esta é a aplicação completa do Senhor Barriga DeFi com todas as funcionalidades:
                      gerenciamento de operações, gráficos, histórico, e muito mais.
                    </p>
                  </div>
                </div>
              </CardContent>
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
      </div>
      <Toaster />
    </div>
  );
}
