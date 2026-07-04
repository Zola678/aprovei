"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Save, BookOpen, ShieldCheck, Check, AlertCircle, Bell, Key, Eye, HelpCircle } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    educational_level: 'university_access',
    password: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      
      const { data } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(data);
      
      setFormData({
        educational_level: data.educational_level || 'university_access',
        password: ''
      });

    } catch (err) {
      showToast("Erro ao carregar configurações.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updatePayload: any = { ...formData };
      if (!updatePayload.password) delete updatePayload.password;
      
      await api.put('/auth/me', updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast("Configurações salvas com sucesso!", "success");
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Erro ao atualizar configurações.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin"></div>
        <p className="text-white/60 font-semibold animate-pulse">A carregar Configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0 pt-6 sm:pt-0 font-sans max-w-4xl mx-auto">
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-55 p-4 rounded-2xl border font-bold shadow-2xl flex items-center gap-3 ${
              toastMsg.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {toastMsg.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all" onClick={() => router.push('/dashboard/profile')}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange flex items-center justify-center text-white font-black text-2xl overflow-hidden border-2 border-orange/20">
             {user?.photo_url ? (
               <img src={`/${user.photo_url}`} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <span>{(user?.full_name || 'US').substring(0, 2).toUpperCase()}</span>
             )}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{user?.full_name}</h2>
            <p className="text-white/50 text-sm mt-0.5">Gerir o teu perfil e informações públicas</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Conta & Segurança */}
        <div className="bg-lilac-dark/45 border border-white/10 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl overflow-hidden">
          <div className="p-5 sm:p-8 border-b border-white/10">
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-orange" /> Conta & Segurança
            </h3>
            <p className="text-white/50 text-sm mt-1">Configura a tua senha e nível de ensino (usado para IA e Exercícios)</p>
          </div>
          
          <div className="p-5 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Nível de Ensino Atual</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors z-10" />
                  <select
                    name="educational_level"
                    value={formData.educational_level}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white cursor-pointer appearance-none shadow-sm relative"
                  >
                    <option value="university_access" className="bg-[#18111e] text-white">Acesso Universitário (Preparação)</option>
                    <option value="high_school" className="bg-[#18111e] text-white">Ensino Médio (10ª à 12ª Classe)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/60 z-10">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Alterar Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nova senha (deixar em branco p/ manter)"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                  />
                </div>
              </div>

            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-orange px-6 py-3 rounded-xl font-black flex items-center gap-2 disabled:opacity-70 text-sm"
              >
                {saving ? (
                  <>A Guardar...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Guardar Segurança
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Preferências Visuais Dummy / Estilo WhatsApp */}
      <div className="bg-lilac-dark/45 border border-white/10 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl overflow-hidden">
         <div className="flex items-center gap-4 p-5 sm:p-6 border-b border-white/5 cursor-not-allowed opacity-60 hover:bg-white/5 transition-colors">
            <div className="p-3 bg-white/5 rounded-full"><Eye className="w-6 h-6 text-white" /></div>
            <div>
              <h4 className="text-lg font-bold text-white">Privacidade</h4>
              <p className="text-sm text-white/50">Bloqueios, foto de perfil, visto por último</p>
            </div>
         </div>
         <div className="flex items-center gap-4 p-5 sm:p-6 border-b border-white/5 cursor-not-allowed opacity-60 hover:bg-white/5 transition-colors">
            <div className="p-3 bg-white/5 rounded-full"><Bell className="w-6 h-6 text-white" /></div>
            <div>
              <h4 className="text-lg font-bold text-white">Notificações</h4>
              <p className="text-sm text-white/50">Sons, mensagens, alertas das provas</p>
            </div>
         </div>
         <div className="flex items-center gap-4 p-5 sm:p-6 cursor-not-allowed opacity-60 hover:bg-white/5 transition-colors">
            <div className="p-3 bg-white/5 rounded-full"><HelpCircle className="w-6 h-6 text-white" /></div>
            <div>
              <h4 className="text-lg font-bold text-white">Ajuda</h4>
              <p className="text-sm text-white/50">Central de ajuda, contacte-nos, política de privacidade</p>
            </div>
         </div>
      </div>
      
    </div>
  );
}
