'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function UserNav() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Button variant="ghost" asChild>
          <a href="/auth/signin" className="text-slate-300 hover:text-white dark:text-slate-400 dark:hover:text-white">
            Entrar
          </a>
        </Button>
        <Button asChild>
          <a href="/auth/signup" className="bg-slate-600 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600">
            Criar conta
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
              <AvatarFallback className="bg-slate-600 text-white text-sm dark:bg-slate-700">
                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 px-3 py-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-slate-900 dark:text-slate-100">{session.user.name}</p>
            <p className="text-xs leading-none text-slate-600 dark:text-slate-400">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-600" />
        <DropdownMenuItem className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-slate-100">
          <User className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-slate-100">
          <Settings className="mr-2 h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-600" />
        <DropdownMenuItem 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
