"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, BookOpen, MessageSquare, 
  LogOut, Type, Sun, Bot, Clock, Menu, X, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Visão Geral', shortName: 'Início', path: '/admin', icon: LayoutDashboard },
  { name: 'Utilizadores', shortName: 'Users', path: '/admin/users', icon: Users },
  { name: 'Pendentes', shortName: 'Pending', path: '/admin/pendings', icon: Clock },
  { name: 'Provas', shortName: 'Provas', path: '/admin/exams', icon: BookOpen },
  { name: 'Fórum', shortName: 'Fórum', path: '/admin/forum', icon: MessageSquare },
  { name: 'AIA', shortName: 'AIA', path: '/admin/ai', icon: Bot },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
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
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize === 'large' ? '18px' : '16px';
    if (contrast === 'high') {
      document.documentElement.classList.add('contrast-150');
    } else {
      document.documentElement.classList.remove('contrast-150');
    }
  }, [fontSize, contrast]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname === path || pathname.startsWith(path + '/');
  };

  const currentPage = menuItems.find(item => isActive(item.path))?.name || 'Administração';

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-lilac-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange/30 border-t-orange rounded-full animate-spin" />
          <p className="text-white/60 text-sm font-medium">A carregar painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lilac-dark text-white flex">
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex w-64 lg:w-72 bg-lilac-dark border-r border-lilac-light/20 flex-col h-screen sticky top-0 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        
        {/* Logo */}
        <div className="p-6 border-b border-lilac-light/20">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center font-black text-xl text-lilac-dark shadow-orange-glow shrink-0">
              A
            </div>
            <div>
              <h1 className="font-title font-black text-lg leading-tight text-white">APROVEI</h1>
              <p className="text-[10px] text-orange uppercase font-bold tracking-widest">Admin Pro</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest px-3 mb-3">Menu Principal</p>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group relative ${
                  active
                    ? 'bg-orange text-lilac-dark shadow-orange-glow'
                    : 'text-white/60 hover:bg-lilac-light/15 hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-orange rounded-xl"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Accessibility + User + Logout */}
        <div className="p-4 border-t border-lilac-light/20 space-y-3">
          {/* Accessibility toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                fontSize === 'large'
                  ? 'bg-orange text-lilac-dark'
                  : 'bg-lilac-light/10 text-white/50 hover:text-white'
              }`}
              title="Tamanho da Fonte"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Fonte</span>
            </button>
            <button
              onClick={() => setContrast(contrast === 'normal' ? 'high' : 'normal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                contrast === 'high'
                  ? 'bg-orange text-lilac-dark'
                  : 'bg-lilac-light/10 text-white/50 hover:text-white'
              }`}
              title="Alto Contraste"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Contraste</span>
            </button>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-lilac-light/10">
            <div className="w-8 h-8 rounded-full bg-orange/20 border border-orange/40 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-orange">{user.full_name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight truncate">{user.full_name}</p>
              <p className="text-[10px] text-orange uppercase font-bold">Admin</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm text-red-400 hover:bg-red-400/10 border border-red-400/20 hover:border-red-400/40 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* ─── TOP HEADER (Mobile + Desktop) ─── */}
        <header className="h-14 md:h-16 bg-lilac-dark/95 border-b border-lilac-light/20 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shrink-0">
          {/* Left: Hamburger (mobile) + Title */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-lilac-light/10 text-white/70 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">{currentPage}</h2>
              <p className="text-[10px] text-white/40 hidden md:block">Painel de Administração</p>
            </div>
          </div>

          {/* Right: Accessibility (desktop) + Avatar */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="hidden md:flex items-center gap-1 bg-lilac-light/10 rounded-xl p-1">
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                className={`p-2 rounded-lg transition-all ${fontSize === 'large' ? 'bg-orange text-lilac-dark' : 'text-white/50 hover:text-white'}`}
                title="Tamanho da Fonte"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={() => setContrast(contrast === 'normal' ? 'high' : 'normal')}
                className={`p-2 rounded-lg transition-all ${contrast === 'high' ? 'bg-orange text-lilac-dark' : 'text-white/50 hover:text-white'}`}
                title="Alto Contraste"
              >
                <Sun className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-orange/20 border-2 border-orange/50 flex items-center justify-center">
              <span className="text-xs font-black text-orange">{user.full_name?.charAt(0)?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* ─── PAGE CONTENT ─── */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed top-0 left-0 h-full w-72 bg-lilac-dark border-r border-lilac-light/20 z-50 flex flex-col md:hidden shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-lilac-light/20">
                <Link href="/admin" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-9 h-9 bg-orange rounded-xl flex items-center justify-center font-black text-lg text-lilac-dark shadow-orange-glow">
                    A
                  </div>
                  <div>
                    <h1 className="font-title font-black text-base text-white">APROVEI</h1>
                    <p className="text-[9px] text-orange uppercase font-bold tracking-widest">Admin Pro</p>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-lilac-light/10 text-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Nav */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                        active
                          ? 'bg-orange text-lilac-dark shadow-orange-glow'
                          : 'text-white/70 hover:bg-lilac-light/15 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-lilac-light/20 space-y-3">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-lilac-light/10">
                  <div className="w-9 h-9 rounded-full bg-orange/20 border border-orange/40 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-orange">{user.full_name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user.full_name}</p>
                    <p className="text-[10px] text-orange uppercase font-bold">Admin</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm text-red-400 hover:bg-red-400/10 border border-red-400/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Terminar Sessão</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MOBILE BOTTOM TAB BAR (WhatsApp style) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-lilac-dark border-t border-lilac-light/20 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-col items-center gap-1 px-2 py-1.5 relative min-w-0"
              >
                <div className={`relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-200 ${
                  active ? 'bg-orange shadow-orange-glow scale-110' : 'hover:bg-lilac-light/10'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'text-lilac-dark' : 'text-white/50'}`} />
                </div>
                <span className={`text-[9px] font-bold truncate max-w-[48px] text-center leading-tight transition-colors ${
                  active ? 'text-orange' : 'text-white/40'
                }`}>
                  {item.shortName}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
