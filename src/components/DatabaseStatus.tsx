'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface DatabaseStatus {
  success: boolean;
  message: string;
  error?: string;
}

export default function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        message: 'Erro ao testar conexão',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Status do Banco de Dados
          {status?.success ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : status?.success === false ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Testando conexão...</span>
          </div>
        ) : status ? (
          <div className="space-y-2">
            <p className={`text-sm ${status.success ? 'text-green-600' : 'text-red-600'}`}>
              {status.message}
            </p>
            {status.error && (
              <p className="text-xs text-red-500 bg-red-50 p-2 rounded">
                {status.error}
              </p>
            )}
          </div>
        ) : null}
        
        <Button 
          onClick={testConnection} 
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Testando...
            </>
          ) : (
            'Testar Conexão'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
