'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, Database } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Será redirecionado pelo hook
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600">
            Bem-vindo, {user?.name || user?.email}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Perfil do Usuário
              </CardTitle>
              <User className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {user?.name || 'Usuário'}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {user?.email}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Status da Conta
              </CardTitle>
              <Shield className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Ativa
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Conta verificada
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Banco de Dados
              </CardTitle>
              <Database className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                Conectado
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Neon PostgreSQL
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Informações da Sessão
              </CardTitle>
              <CardDescription className="text-slate-600">
                Detalhes da sua sessão atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">ID do Usuário</label>
                  <p className="text-sm text-slate-900 mt-1">{user?.id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-sm text-slate-900 mt-1">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Nome</label>
                  <p className="text-sm text-slate-900 mt-1">{user?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Imagem</label>
                  <p className="text-sm text-slate-900 mt-1">{user?.image ? 'Disponível' : 'Não disponível'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
