"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, ArrowRight, Shield, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';

const sponsors = [
  { img: "/WhatsApp Image 2026-06-22 at 15.36.43 (1).jpeg", name: "Universidade Agostinho Neto" },
  { img: "/WhatsApp Image 2026-06-22 at 15.36.43 (2).jpeg", name: "Ministério da Educação" },
  { img: "/WhatsApp Image 2026-06-22 at 15.36.43 (3).jpeg", name: "Unitel" },
  { img: "/WhatsApp Image 2026-06-22 at 15.36.43 (5).jpeg", name: "ISUTIC" },
];

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentSponsor, setCurrentSponsor] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSponsor((prev) => (prev + 1) % sponsors.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-x-hidden overflow-y-auto w-full m-0 p-0 pt-28 pb-12">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-lilac-light/20 rounded-full filter blur-[100px] -z-10 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-orange/10 rounded-full filter blur-[120px] -z-10 pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      
      <div className="w-full max-w-7xl min-h-[80vh] h-auto md:rounded-[3rem] overflow-visible flex flex-col md:flex-row bg-lilac-base/15 border border-lilac-light/20 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 py-6 md:py-0">
        
        {/* Left Form Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-start md:justify-center p-8 md:p-12 lg:p-16 relative overflow-y-auto custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
          >
            <div className="mb-10 space-y-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                className="p-3 bg-orange/10 w-fit rounded-2xl text-orange shadow-sm mb-6 border border-orange/20"
              >
                <LogIn className="w-6 h-6" />
              </motion.div>
              <h2 className="text-4xl font-black text-white tracking-tight font-title">Bem-vindo de <span className="text-orange-glow">volta</span></h2>
              <p className="text-white/60 font-medium">Insere as tuas credenciais para continuares a tua jornada.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-8 text-sm text-rose-400 bg-rose-950/40 rounded-2xl border border-rose-800/40 font-bold flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/60 ml-1 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="teuemail@aprovei.ao"
                    className="w-full pl-12 pr-4 py-4 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Senha</label>
                  <a href="#" className="text-xs text-orange font-bold hover:text-orange/80 transition-colors">Esqueceste a senha?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-orange py-4 mt-2 text-lg flex items-center justify-center gap-3 group shadow-lg"
              >
                <span className="text-lilac-dark font-black">{loading ? 'Entrando...' : 'Entrar na Plataforma'}</span>
                {!loading && <ArrowRight className="w-5 h-5 text-lilac-dark group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-white/60 font-medium">
              <span>Ainda não tens conta? </span>
              <a href="/auth/register" className="text-orange font-bold hover:text-orange/80 transition-colors">Criar Conta Agora</a>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar Side with Partners Slider */}
        <div className="hidden md:flex w-1/2 relative bg-lilac-dark/30 overflow-hidden items-end p-12">
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-lilac-dark/95 via-lilac-dark/30 to-transparent z-10"></div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSponsor}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={sponsors[currentSponsor].img} 
                alt="Sponsor" 
                className="w-full h-full object-cover opacity-80" 
              />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-20 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="card-lilac-glass bg-lilac-base/35 border-lilac-light/30 text-white p-8 rounded-[2rem] shadow-xl"
            >
               <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-orange animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-widest text-orange">Parceiros Oficiais</span>
               </div>
               <AnimatePresence mode="wait">
                 <motion.h3 
                    key={currentSponsor}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-black mb-2 text-white font-title"
                 >
                   {sponsors[currentSponsor].name}
                 </motion.h3>
               </AnimatePresence>
               <p className="text-white/75 font-medium">Apoiam a tua jornada rumo ao sucesso académico e profissional com o APROVEI.</p>
               
               {/* Progress indicators */}
               <div className="flex gap-2 mt-6">
                 {sponsors.map((_, i) => (
                   <div 
                     key={i} 
                     className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSponsor ? 'w-8 bg-orange shadow-[0_0_10px_rgba(255,107,0,0.5)]' : 'w-2 bg-lilac-light/30'}`}
                   />
                 ))}
               </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
