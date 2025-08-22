'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        disabled
      >
        <Sun className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        <span className="sr-only">Carregando tema</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 px-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      ) : (
        <Sun className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      </span>
    </Button>
  );
}
