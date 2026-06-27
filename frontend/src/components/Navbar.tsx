"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, ChevronRight, BookOpen, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useModule } from "@/context/ModuleContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const { activeModule, setActiveModule } = useModule();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isPublicPage = pathname === "/" || pathname === "/auth/login" || pathname === "/auth/register";
  if (isLoggedIn && !isPublicPage) return null;
  if (pathname?.startsWith("/dashboard") && !isPublicPage) return null;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-lilac-dark/90 backdrop-blur-xl border-b border-lilac-light/20 shadow-[0_4px_30px_rgba(46,18,69,0.4)] py-4" : "bg-transparent py-6"}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105 p-1 bg-white/5 border border-white/10 shadow-md">
            <img src="/logoAprovei.jpeg" alt="APROVEI Logo" className="h-10 w-auto rounded-lg" />
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay"></div>
          </div>
        </a>
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <div className="flex gap-4 lg:gap-6 bg-lilac-base/30 backdrop-blur-md px-5 py-2 rounded-full border border-lilac-light/30 shadow-sm">
            {[
              { name: "Início", path: "/" },
              { 
                name: activeModule === "high_school" ? "Materiais Médio" : activeModule === "university_access" ? "Provas de Acesso" : "Provas", 
                path: "/exams" 
              },
              { name: "Professores", path: "/teachers" },
              { name: "Fórum", path: "/forum" },
              { name: "IA Tutor", path: "/ai-chat" }
            ].map((link) => (
              <a 
                key={link.name} 
                href={link.path} 
                className="relative text-sm font-semibold text-white/80 hover:text-orange-accent transition-colors group py-1"
              >
                {link.name}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-orange-accent rounded-full transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(255,107,0,0.8)]"></span>
              </a>
            ))}
          </div>

          {/* Module Switcher (Desktop) */}
          <div className="flex bg-lilac-dark/60 border border-lilac-light/30 p-1 rounded-full text-xs font-bold shadow-inner backdrop-blur-sm shrink-0">
            <button
              onClick={() => setActiveModule("high_school")}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-300 ${activeModule === "high_school" ? "bg-primary text-white shadow-md border border-lilac-light/20" : "text-white/60 hover:text-white"}`}
              title="Módulo Ensino Médio"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ensino Médio</span>
            </button>
            <button
              onClick={() => setActiveModule("university_access")}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-300 ${activeModule === "university_access" ? "bg-orange-accent text-lilac-dark shadow-md border border-orange-accent/20" : "text-white/60 hover:text-white"}`}
              title="Módulo Acesso Universitário"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Acesso Superior</span>
            </button>
          </div>
        </div>
        
        {/* Auth Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <a href="/auth/login" className="text-sm font-semibold text-white/75 hover:text-white transition-colors">
            Entrar
          </a>
          <a href="/auth/register" className="btn-orange flex items-center gap-1.5 group px-5 py-2 text-sm shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:shadow-[0_0_25px_rgba(255,107,0,0.6)]">
            <span>Começar</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden relative z-50 p-2 text-white bg-lilac-base/40 backdrop-blur-md rounded-full border border-lilac-light/30 shadow-md" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5 text-orange-accent" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-full left-0 w-full bg-lilac-dark/95 backdrop-blur-3xl shadow-2xl flex flex-col px-6 py-8 gap-6 md:hidden border-t border-lilac-light/20"
          >
            {/* Module Switcher (Mobile) */}
            <div className="flex bg-lilac-base/30 border border-lilac-light/20 p-1.5 rounded-2xl text-sm font-bold shadow-inner">
              <button
                onClick={() => {
                  setActiveModule("high_school");
                  setIsOpen(false);
                }}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${activeModule === "high_school" ? "bg-primary text-white shadow-md" : "text-white/65"}`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Ensino Médio</span>
              </button>
              <button
                onClick={() => {
                  setActiveModule("university_access");
                  setIsOpen(false);
                }}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${activeModule === "university_access" ? "bg-orange-accent text-lilac-dark shadow-md" : "text-white/65"}`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Acesso Superior</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: "Início", path: "/" },
                { 
                  name: activeModule === "high_school" ? "Materiais Ensino Médio" : activeModule === "university_access" ? "Provas de Acesso Universitário" : "Provas e Materiais", 
                  path: "/exams" 
                },
                { name: "Professores", path: "/teachers" },
                { name: "Fórum da Comunidade", path: "/forum" },
                { name: "IA Tutor Académico", path: "/ai-chat" }
              ].map((link, i) => (
                <motion.a 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={link.name} 
                  href={link.path} 
                  className="text-base font-bold text-white hover:text-orange-accent border-b border-lilac-light/10 pb-2 flex justify-between items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-orange-accent" />
                </motion.a>
              ))}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-3 mt-4"
            >
              <a href="/auth/login" className="text-center font-bold text-white hover:text-orange-accent py-3 rounded-xl bg-lilac-base/30 border border-lilac-light/20 text-sm">
                Entrar
              </a>
              <a href="/auth/register" className="btn-orange flex justify-center py-3.5 text-sm font-bold shadow-[0_0_15px_rgba(255,107,0,0.4)]">
                Começar Agora
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
