"use client";
import React from "react";
import { Instagram, Linkedin, Facebook, MapPin, Mail, Phone, ArrowRight, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { useState, useEffect } from "react";

export default function Footer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [pathname]);
  
  const isPublicPage = pathname === "/" || pathname === "/auth/login" || pathname === "/auth/register";
  if (isLoggedIn && !isPublicPage) return null;
  if (pathname?.startsWith("/dashboard") && !isPublicPage) return null;

  return (
    <footer className="relative bg-lilac-dark text-white pt-24 pb-10 overflow-hidden border-t border-lilac-light/20">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-accent/5 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/3 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* Logo & Description */}
          <div className="md:col-span-4 flex flex-col items-start text-left">
            <div className="bg-white/5 p-2 rounded-2xl shadow-md border border-white/10 mb-6 transition-transform hover:scale-105 duration-300">
              <img src="/logoAprovei.jpeg" alt="APROVEI Logo" className="h-14 w-auto rounded-xl" />
            </div>
            <p className="text-white/70 leading-relaxed mb-8 font-medium text-sm pr-4">
              Revolucionamos o suporte académico e o acesso universitário em Angola com materiais focados, tutores especializados e uma IA exclusiva integrada no currículo nacional.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Instagram className="w-5 h-5" />, link: "https://www.instagram.com/pea.angola" },
                { icon: <Linkedin className="w-5 h-5" />, link: "https://www.linkedin.com/company/pea-angola" },
                { icon: <Facebook className="w-5 h-5" />, link: "https://www.facebook.com/pea.angola" }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-11 h-11 rounded-full bg-lilac-base/35 border border-lilac-light/20 flex items-center justify-center hover:bg-orange-accent hover:border-orange-accent hover:text-lilac-dark hover:scale-110 hover:shadow-[0_0_15px_rgba(255,107,0,0.5)] transition-all duration-300 text-white/80"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Column 2: Recursos */}
          <div className="md:col-span-2 text-left">
            <h4 className="font-black text-sm mb-8 uppercase tracking-widest text-orange-accent text-orange-glow">
              Recursos
            </h4>
            <ul className="space-y-4 text-white/70 text-sm font-semibold">
              {['Provas Resolvidas', 'Tutores de Angola', 'Ensino Médio', 'Estudo com IA'].map((item, i) => (
                <li key={i}>
                  <a className="hover:text-orange-accent hover:translate-x-2 transition-all duration-300 flex items-center gap-3 group" href="#">
                    <span className="w-1.5 h-1.5 bg-orange-accent/30 group-hover:bg-orange-accent rounded-full transition-colors"></span> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Institucional */}
          <div className="md:col-span-3 text-left">
            <h4 className="font-black text-sm mb-8 uppercase tracking-widest text-orange-accent text-orange-glow">
              Institucional
            </h4>
            <ul className="space-y-4 text-white/70 text-sm font-semibold">
              {['Quem Somos (PEA)', 'Fórum da Comunidade', 'Blog do Estudante', 'Perguntas Frequentes'].map((item, i) => (
                <li key={i}>
                  <a className="hover:text-orange-accent hover:translate-x-2 transition-all duration-300 flex items-center gap-3 group" href="#">
                    <span className="w-1.5 h-1.5 bg-orange-accent/30 group-hover:bg-orange-accent rounded-full transition-colors"></span> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 4: Contato */}
          <div className="md:col-span-3 text-left">
            <h4 className="font-black text-sm mb-8 uppercase tracking-widest text-orange-accent text-orange-glow">
              Contacto
            </h4>
            <ul className="space-y-5 text-white/70 text-sm font-semibold">
              <li className="flex items-start gap-4 group cursor-pointer hover:text-orange-accent transition-colors">
                <div className="p-2 bg-lilac-base/30 rounded-lg group-hover:bg-orange-accent/10 group-hover:text-orange-accent border border-lilac-light/10 transition-colors">
                  <MapPin className="w-4 h-4 text-orange-accent" />
                </div>
                <span className="pt-1">Rua Rainha Njinga Mbande<br/>Luanda, Angola</span>
              </li>
              <li className="flex items-center gap-4 group cursor-pointer hover:text-orange-accent transition-colors">
                <div className="p-2 bg-lilac-base/30 rounded-lg group-hover:bg-orange-accent/10 group-hover:text-orange-accent border border-lilac-light/10 transition-colors">
                  <Mail className="w-4 h-4 text-orange-accent" />
                </div>
                <span>geral-pea@outlook.com</span>
              </li>
              <li className="flex items-center gap-4 group cursor-pointer hover:text-orange-accent transition-colors">
                <div className="p-2 bg-lilac-base/30 rounded-lg group-hover:bg-orange-accent/10 group-hover:text-orange-accent border border-lilac-light/10 transition-colors">
                  <Phone className="w-4 h-4 text-orange-accent" />
                </div>
                <span>+244 953 495 980</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter Section (Glassmorphism) */}
        <div className="card-lilac-glass border-orange-accent/20 p-8 md:p-12 mb-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10">
            <div className="w-full lg:w-1/2 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lilac-dark/50 border border-lilac-light/20 text-orange-accent text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Newsletter VIP</span>
              </div>
              <h5 className="text-3xl font-black text-white font-title leading-tight mb-3">Garante a tua aprovação!</h5>
              <p className="text-white/70 text-base font-medium max-w-md">Junta-te aos melhores estudantes de Angola e recebe resumos, dicas e exames resolvidos por email.</p>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <div className="relative group flex flex-col sm:flex-row items-stretch sm:items-center p-1.5 bg-lilac-dark/60 border border-lilac-light/30 rounded-2xl focus-within:border-orange-accent focus-within:ring-4 focus-within:ring-orange-accent/10 transition-all shadow-inner">
                <input 
                  type="email" 
                  placeholder="O teu e-mail principal..." 
                  className="w-full bg-transparent p-4 text-white placeholder-white/40 focus:outline-none text-sm font-semibold"
                />
                <button className="btn-orange py-3.5 px-8 text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,107,0,0.4)] whitespace-nowrap mt-2 sm:mt-0">
                  <span>Subscrever</span>
                  <ArrowRight className="w-4 h-4 text-lilac-dark" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-lilac-light/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 text-sm font-semibold">
            &copy; {new Date().getFullYear()} APROVEI. Desenvolvido em parceria com a PEA.
          </p>
          <div className="flex gap-8 text-sm font-semibold text-white/40">
            <a href="#" className="hover:text-orange-accent transition-colors">Privacidade</a>
            <a href="#" className="hover:text-orange-accent transition-colors">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
