"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, BookOpen, Video, Users, MessageSquare, Calendar, Settings, LogOut, Search, Bell, Sparkles, Pin, PinOff, Bot, Menu } from 'lucide-react';

export default function SessionLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPinned, setIsPinned] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    } else {
      setIsLoggedIn(false);
    }
    
    // Load pin preference
    const pinnedPref = localStorage.getItem('sidebar_pinned');
    if (pinnedPref) {
      setIsPinned(pinnedPref === 'true');
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/auth/login');
  };

  const togglePin = () => {
    const newPin = !isPinned;
    setIsPinned(newPin);
    localStorage.setItem('sidebar_pinned', String(newPin));
  };

  const isGuestPage = pathname === "/" || pathname === "/auth/login" || pathname === "/auth/register";

  if (!isLoggedIn || isGuestPage) {
    // Logged out wrapper: add padding-top for Navbar
    return <div className="pt-24 w-full flex-grow">{children}</div>;
  }

  const getNavItems = () => {
    if (!user) return [];
    
    if (user.role === 'admin') {
      return [
        { icon: <Home />, label: "Painel de Controle", path: "/dashboard" },
        { icon: <BookOpen />, label: "Gerir Provas", path: "/exams" },
        { icon: <MessageSquare />, label: "Moderação Fórum", path: "/forum" },
        { icon: <Bot />, label: "IA Tutor", path: "/ai-chat" },
      ];
    }
    
    if (user.role === 'teacher') {
      return [
        { icon: <Home />, label: "Painel do Explicador", path: "/dashboard" },
        { icon: <Video />, label: "Minhas Turmas", path: "/preparatorio" },
        { icon: <MessageSquare />, label: "Comunidade IA", path: "/forum" },
        { icon: <Bot />, label: "IA Tutor", path: "/ai-chat" },
      ];
    }
    
    // Estudante (Default)
    return [
      { icon: <Home />, label: "Painel de Estudos", path: "/dashboard" },
      { icon: <BookOpen />, label: "Provas & Exames", path: "/exams" },
      { icon: <Video />, label: "Turmas Prep", path: "/preparatorio" },
      { icon: <Users />, label: "Tutores", path: "/teachers" },
      { icon: <MessageSquare />, label: "Comunidade IA", path: "/forum" },
      { icon: <Calendar />, label: "Plano de Estudo", path: "/study" },
      { icon: <Bot />, label: "IA Tutor", path: "/ai-chat" },
    ];
  };

  const navItems = getNavItems();

  // Render when logged in
  return (
    <div className="flex min-h-screen bg-background w-full relative overflow-hidden">
      
      {/* Floating Trigger Handle - indicator on the left side when collapsed */}
      {!isPinned && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 p-3 bg-orange text-lilac-dark rounded-full shadow-[0_0_15px_rgba(255,107,0,0.5)] cursor-pointer hover:scale-110 transition-all z-40 animate-pulse-slow">
          <Menu className="w-5 h-5" />
        </div>
      )}

      {/* Sidebar Wrapper (handles hover trigger on left edge) */}
      <div 
        className={
          isPinned 
            ? "w-72 shrink-0 relative z-50 transition-all duration-300"
            : "fixed left-0 top-0 bottom-0 w-4 hover:w-72 z-50 group bg-transparent transition-all duration-300"
        }
      >
        {/* Sidebar Content container */}
        <aside 
          className={
            isPinned
              ? "w-72 h-screen flex flex-col bg-lilac-dark/45 border-r border-white/10 sticky top-0 shadow-2xl backdrop-blur-2xl overflow-hidden relative"
              : "w-72 h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-lilac-dark/95 border-r border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col relative"
          }
        >
          <div className="p-6 flex items-center justify-between gap-3 border-b border-white/5">
            <div className="relative overflow-hidden rounded-xl">
              <img src="/logoAprovei.jpeg" alt="APROVEI Logo" className="h-10 w-auto rounded-lg shadow-sm" />
            </div>
            
            {/* Lock/Pin button */}
            <button 
              onClick={togglePin}
              className="p-2 text-white/45 hover:text-orange hover:bg-white/5 rounded-xl transition-all"
              title={isPinned ? "Desafixar menu" : "Fixar menu"}
            >
              {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="px-6 py-4 flex-grow overflow-y-auto custom-scrollbar relative z-10 space-y-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-4 ml-4 text-left">Navegação</p>
              <nav className="space-y-1.5">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.path;
                  return (
                    <a 
                      key={index} 
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden ${
                        isActive 
                          ? 'bg-orange/10 text-orange border border-orange/20 shadow-sm' 
                          : 'text-white/60 hover:bg-white/5 hover:text-orange border border-transparent'
                      }`}
                    >
                      <div className={`transition-transform duration-300 group-hover:scale-105 ${isActive ? 'text-orange' : 'text-white/40 group-hover:text-orange'}`}>
                        {React.cloneElement(item.icon as React.ReactElement, { className: "w-5 h-5" })}
                      </div>
                      <span className="relative z-10 text-left">{item.label}</span>
                      {isActive && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1 bg-orange rounded-r-full shadow-[0_0_10px_rgba(255,107,0,0.5)]"
                        />
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* User Stats / Points Preview */}
            <div className="pt-2">
              <div className="bg-orange/5 border border-orange/10 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-orange/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange/20 rounded-xl text-orange group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Pontos</p>
                    <p className="text-sm font-black text-white">1,240 XP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/5 relative z-10">
            <nav className="space-y-1.5">
              <a href="#" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-white/60 hover:bg-white/5 hover:text-orange transition-all duration-300 group border border-transparent">
                <Settings className="w-5 h-5 text-white/40 group-hover:text-orange transition-transform group-hover:rotate-90 duration-500" />
                <span className="text-left">Configurações</span>
              </a>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 group border border-transparent"
              >
                <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 group-hover:-translate-x-1 transition-transform" />
                <span className="text-left">Sair da Conta</span>
              </button>
            </nav>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full relative px-6 md:px-8 py-8 h-screen overflow-y-auto custom-scrollbar flex flex-col">
        
        {/* Top interactive bar for notifications and user profile */}
        {user?.role !== 'admin' && (
          <div className="flex justify-end items-center mb-10 bg-lilac-dark/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <button className="relative p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10 group text-white">
                  <Bell className="w-5 h-5 text-white/60 group-hover:text-orange transition-colors" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"></span>
               </button>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                 <img 
                   src={user && user.photo_url ? `http://localhost:8000/${user.photo_url}` : "https://i.pravatar.cc/150?img=33"} 
                   alt="Profile" 
                   className="w-full h-full rounded-full border-2 border-white object-cover" 
                 />
               </div>
            </div>
          </div>
        )}

        {/* Child Page Contents */}
        <div className="flex-grow w-full max-w-full">
          {children}
        </div>
      </main>

    </div>
  );
}
