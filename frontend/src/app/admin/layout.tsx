"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, BookOpen, MessageSquare, 
  Settings, LogOut, Type, Sun
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setLoading(false);
      }
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  useEffect(() => {
    if (fontSize === 'large') {
      document.documentElement.classList.add('text-lg');
    } else {
      document.documentElement.classList.remove('text-lg');
    }

    if (contrast === 'high') {
      document.documentElement.classList.add('contrast-150');
    } else {
      document.documentElement.classList.remove('contrast-150');
    }
  }, [fontSize, contrast]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a050d] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Visão Geral', path: '/admin', icon: LayoutDashboard },
    { name: 'Utilizadores', path: '/admin/users', icon: Users },
    { name: 'Pendentes', path: '/admin/pendings', icon: Users },
    { name: 'Provas', path: '/admin/exams', icon: BookOpen },
    { name: 'Fórum', path: '/admin/forum', icon: MessageSquare },
    { name: 'AIA (Inteligência)', path: '/admin/ai', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a050d] text-white">
      <aside className="w-64 bg-[#130a18] border-r border-white/10 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange text-lilac-dark rounded-xl flex items-center justify-center font-black text-xl">
              A
            </div>
            <div>
              <h1 className="font-title font-black text-xl leading-tight">APROVEI</h1>
              <p className="text-[10px] text-orange uppercase font-bold tracking-widest">Admin Pro</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            // Strict match for Overview
            if (item.path === '/admin' && pathname !== '/admin') return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-white/60 hover:bg-white/5 hover:text-white`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-orange text-lilac-dark shadow-md' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-400/10 transition-all w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        <header className="h-16 border-b border-white/10 bg-[#130a18]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="md:hidden font-title font-black text-xl flex items-center gap-2">
             <span className="text-orange">Aprovei</span> <span className="text-xs border border-white/20 rounded px-2">Admin</span>
          </div>
          <div className="hidden md:block text-sm text-white/50 font-medium">
             Administração do Sistema
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
              <button 
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                className={`p-2 rounded-md transition-colors ${fontSize === 'large' ? 'bg-orange/20 text-orange' : 'text-white/50 hover:text-white'}`}
                title="Aumentar Fonte"
              >
                <Type className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setContrast(contrast === 'normal' ? 'high' : 'normal')}
                className={`p-2 rounded-md transition-colors ${contrast === 'high' ? 'bg-orange/20 text-orange' : 'text-white/50 hover:text-white'}`}
                title="Alto Contraste"
              >
                <Sun className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-lilac-dark border border-white/20 flex items-center justify-center">
                <span className="text-sm font-bold text-orange">{user.full_name?.charAt(0)}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-white/50 uppercase">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 flex-1">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#130a18] border-t border-white/10 p-2 flex overflow-x-auto hide-scrollbar z-40">
        <div className="flex w-max mx-auto gap-1 px-2 pb-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            
            // Tratamento especial para "Visão Geral" (Overview)
            if (item.path === '/admin' && pathname !== '/admin') return (
              <Link
                key={item.path}
                href={item.path}
                className={`p-3 rounded-xl flex flex-col items-center gap-1 min-w-[72px] shrink-0 text-white/50`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{item.name.split(' ')[0]}</span>
              </Link>
            );

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`p-3 rounded-xl flex flex-col items-center gap-1 min-w-[72px] shrink-0 transition-colors ${
                  isActive ? 'text-orange bg-white/5' : 'text-white/50 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
