'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Token {
  id: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  marketCapRank?: number;
  score: number;
}

interface TokenSearchProps {
  onTokenSelect: (token: { name: string; symbol: string }) => void;
  placeholder?: string;
  className?: string;
}

export function TokenSearch({ onTokenSelect, placeholder = "Buscar token...", className = "" }: TokenSearchProps) {
  const [query, setQuery] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Buscar tokens na API
  const searchTokens = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setTokens([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setShowDropdown(true); // Mostrar dropdown imediatamente ao buscar
    console.log('🔍 Buscando tokens para:', searchQuery, ' - v2');
    
    try {
      const response = await fetch(`/api/tokens/search-test?q=${encodeURIComponent(searchQuery)}`);
      console.log('📡 Resposta da API:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Dados recebidos:', data);

      if (data.success) {
        setTokens(data.tokens);
        setShowDropdown(true); // Sempre mostrar dropdown se há resposta
        setSelectedIndex(-1);
        console.log('✅ Tokens encontrados:', data.tokens.length);
      } else {
        console.error('❌ Erro na API:', data.message);
        setTokens([]);
        setShowDropdown(true); // Mostrar mensagem de erro no dropdown
      }
    } catch (error) {
      console.error('❌ Erro ao buscar tokens:', error);
      setTokens([]);
      setShowDropdown(true); // Mostrar mensagem de erro no dropdown
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce da busca
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchTokens(query);
      }, 300);
    } else {
      setTokens([]);
      setShowDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação com teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || tokens.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < tokens.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < tokens.length) {
          handleTokenSelect(tokens[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleTokenSelect = (token: Token) => {
    onTokenSelect({
      name: token.name,
      symbol: token.symbol
    });
    setQuery(token.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setTokens([]);
  };

  const clearSearch = () => {
    setQuery('');
    setTokens([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            console.log('🎯 Input focado, query:', query, 'tokens:', tokens.length);
            if (query.trim().length >= 2) {
              setShowDropdown(true);
            }
          }}
          className="pl-10 pr-10 h-12 text-base border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 bg-white dark:bg-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 placeholder:text-slate-600 dark:placeholder:text-slate-400 text-slate-900 dark:text-slate-100 font-medium"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              Buscando tokens...
            </div>
          ) : tokens.length > 0 ? (
            <div className="py-2">
              {tokens.map((token, index) => (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => handleTokenSelect(token)}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150 flex items-center space-x-3 ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                  }`}
                >
                  {/* Imagem do token */}
                  <div className="flex-shrink-0">
                    {token.imageUrl ? (
                      <img
                        src={token.imageUrl}
                        alt={token.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {token.symbol.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações do token */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {token.name}
                      </span>
                      <span className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {token.symbol}
                      </span>
                      {token.marketCapRank && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          #{token.marketCapRank}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Score: {(token.score * 100).toFixed(1)}%
                    </div>
                  </div>

                  {/* Ícone de seleção */}
                  {index === selectedIndex && (
                    <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Nenhum token encontrado para &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
