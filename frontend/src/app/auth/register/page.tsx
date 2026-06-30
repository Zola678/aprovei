"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Phone, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sponsors = [
  { img: "/WhatsApp Image 2026-06-22 at 15.36.43 (1).jpeg", name: "Universidade Agostinho Neto" },
  { img: "/WhatsApp Image 2026-06-22 at 15.36.43 (2).jpeg", name: "Ministério da Educação" },
  { img: "/WhatsApp Image 2026-06-22 at 15.36.43 (3).jpeg", name: "Unitel" },
  { img: "/WhatsApp Image 2026-06-22 at 15.36.43 (5).jpeg", name: "ISUTIC" },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student',
    full_name: '',
    phone: '',
    educational_level: 'university_access'
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
      if (formData.role === 'teacher') {
        if (!photoFile) {
          setError('A foto de perfil é obrigatória para professores.');
          setLoading(false);
          return;
        }
        const data = new FormData();
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('full_name', formData.full_name);
        data.append('phone', formData.phone);
        data.append('educational_level', formData.educational_level);
        data.append('photo', photoFile);

        await api.post('/auth/register-teacher', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/auth/register', formData);
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao registrar conta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-x-hidden overflow-y-auto w-full m-0 p-0 pt-28 pb-12">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-orange/10 rounded-full filter blur-[120px] -z-10 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-lilac-light/15 rounded-full filter blur-[150px] -z-10 pointer-events-none animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      
      <div className="w-full max-w-7xl min-h-[85vh] h-auto md:rounded-[3rem] overflow-visible flex flex-col md:flex-row-reverse bg-lilac-base/15 border border-lilac-light/20 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 py-6 md:py-0">
        
        {/* Right Form Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-start md:justify-center p-8 md:p-12 lg:p-16 relative overflow-y-auto custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
          >
            <div className="mb-8 space-y-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                className="p-3 bg-orange/10 w-fit rounded-2xl text-orange shadow-sm mb-4 border border-orange/20"
              >
                <UserPlus className="w-6 h-6" />
              </motion.div>
              <h2 className="text-4xl font-black text-white tracking-tight font-title">Cria a tua <span className="text-orange-glow">Conta</span></h2>
              <p className="text-white/60 font-medium">Começa hoje a tua jornada rumo ao Ensino Superior.</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mb-6 text-sm text-rose-400 bg-rose-950/40 rounded-2xl border border-rose-800/40 font-bold flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 mb-6 text-center text-emerald-400 bg-emerald-950/40 rounded-[2rem] border border-emerald-800/40 font-semibold flex flex-col items-center shadow-sm"
              >
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                <span className="text-xl">Conta criada com sucesso!</span>
                <span className="text-sm font-normal text-emerald-400/85 mt-2">A redirecionar-te para o login...</span>
              </motion.div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Manuel Bernardo"
                      className="w-full pl-12 pr-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="Ex: teuemail@aprovei.ao"
                      className="w-full pl-12 pr-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Telemóvel</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                      <input
                        type="tel"
                        placeholder="923000000"
                        className="w-full pl-12 pr-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Eu sou...</label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3.5 bg-[#18111e] border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white cursor-pointer appearance-none shadow-sm"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="student" className="bg-[#18111e] text-white">Estudante</option>
                        <option value="teacher" className="bg-[#18111e] text-white">Professor</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/60">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {formData.role === 'teacher' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Foto de Perfil (Obrigatória)</label>
                    <input
                      type="file"
                      required
                      accept="image/*"
                      className="w-full px-4 py-3 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl outline-none text-white text-sm focus:border-orange/50 transition-all font-semibold"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setPhotoFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Nível de Ensino</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3.5 bg-[#18111e] border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white cursor-pointer appearance-none shadow-sm"
                      value={formData.educational_level}
                      onChange={e => setFormData({ ...formData, educational_level: e.target.value })}
                    >
                      <option value="university_access" className="bg-[#18111e] text-white">Acesso Universitário (Preparação)</option>
                      <option value="high_school" className="bg-[#18111e] text-white">Ensino Médio (10ª à 12ª Classe)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/60">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Senha (mín 8 chars)</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="Cria uma senha segura"
                      className="w-full pl-12 pr-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-orange py-4 mt-4 text-lg flex items-center justify-center gap-3 group shadow-lg disabled:opacity-70 disabled:hover:shadow-none"
                >
                  <span className="text-lilac-dark font-black">{loading ? 'Criando Conta...' : 'Criar minha Conta'}</span>
                  {!loading && <ArrowRight className="w-5 h-5 text-lilac-dark group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-white/60 font-medium pb-8 md:pb-0">
              <span>Já tens uma conta? </span>
              <a href="/auth/login" className="text-orange font-bold hover:text-orange/80 transition-colors">Fazer Login</a>
            </div>
          </motion.div>
        </div>

        {/* Left Sidebar Side with Partners Slider */}
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
