"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, BookOpen, MapPin, Tag, MessageCircle, DollarSign, AlignLeft, Save, Check, AlertCircle, Camera } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    educational_level: 'university_access',
    specialty: '',
    bio: '',
    price_per_hour: 0,
    whatsapp: '',
    location: '',
    subject_tags: ''
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
      
      let profileData = {
        specialty: '',
        bio: '',
        price_per_hour: 0,
        whatsapp: '',
        location: '',
        subject_tags: ''
      };
      
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        educational_level: data.educational_level || 'university_access',
        ...profileData
      });

      if (data.role === 'teacher') {
        const teacherProfileRes = await api.get('/auth/me/teacher-profile', {
           headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
        
        if (teacherProfileRes && teacherProfileRes.data) {
           setFormData(prev => ({ ...prev, ...teacherProfileRes.data }));
        }
      }
    } catch (err) {
      showToast("Erro ao carregar o perfil.", "error");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price_per_hour' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updatePayload: any = { ...formData };
      
      await api.put('/auth/me', updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const storedUserStr = localStorage.getItem('user');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        storedUser.name = formData.full_name;
        storedUser.full_name = formData.full_name;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }

      showToast("Perfil atualizado com sucesso!", "success");
      fetchProfile();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Erro ao atualizar perfil.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin"></div>
        <p className="text-white/60 font-semibold animate-pulse">A carregar Perfil...</p>
      </div>
    );
  }

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="space-y-6 sm:space-y-10 px-4 sm:px-0 pt-6 sm:pt-0 font-sans max-w-4xl mx-auto">
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

      <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-orange/20 overflow-hidden flex items-center justify-center bg-orange text-white font-black text-4xl shadow-xl">
             {user?.photo_url ? (
               <img src={`/${user.photo_url}`} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <span>{(user?.full_name || 'US').substring(0, 2).toUpperCase()}</span>
             )}
          </div>
          <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl sm:text-4xl font-black text-white">{user?.full_name || 'Utilizador Aprovei'}</h2>
          <p className="text-orange font-bold mt-1 uppercase tracking-wider">{user?.role === 'teacher' ? 'Explicador' : user?.role === 'student' ? 'Estudante' : 'Admin'}</p>
          <p className="text-white/50 text-sm mt-2">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        
        <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl space-y-6">
          <h3 className="text-xl font-black text-white border-b border-white/10 pb-4">Sobre Mim</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Nome de Apresentação</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Seu Nome Completo"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Telemóvel</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Seu número de telemóvel"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-lilac-light/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">Nível de Ensino</label>
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
          </div>
        </div>

        {isTeacher && (
          <div className="bg-orange/5 border border-orange/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl space-y-6">
            <h3 className="text-xl font-black text-orange border-b border-orange/10 pb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Detalhes Públicos do Explicador
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-orange/60 ml-1 uppercase tracking-wider">Mini Biografia (Sobre mim)</label>
                <div className="relative group">
                  <AlignLeft className="absolute left-4 top-6 w-5 h-5 text-orange/40 group-focus-within:text-orange transition-colors" />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Escreve um pouco sobre ti..."
                    className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-orange/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm resize-none custom-scrollbar"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-orange/60 ml-1 uppercase tracking-wider">Especialidade / Cadeira</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange/40 group-focus-within:text-orange transition-colors" />
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    placeholder="Ex: Matemática, Física"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-orange/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-orange/60 ml-1 uppercase tracking-wider">Preço por Hora (Kz)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange/40 group-focus-within:text-orange transition-colors" />
                  <input
                    type="number"
                    name="price_per_hour"
                    value={formData.price_per_hour || ''}
                    onChange={handleChange}
                    placeholder="Ex: 5000"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-orange/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-orange/60 ml-1 uppercase tracking-wider">Localização</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange/40 group-focus-within:text-orange transition-colors" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ex: Luanda, Mutamba"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-orange/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-orange/60 ml-1 uppercase tracking-wider">WhatsApp para Contato</label>
                <div className="relative group">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange/40 group-focus-within:text-orange transition-colors" />
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="Ex: 923000000"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-orange/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-orange/60 ml-1 uppercase tracking-wider">Tags de Disciplinas (separadas por vírgula)</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange/40 group-focus-within:text-orange transition-colors" />
                  <input
                    type="text"
                    name="subject_tags"
                    value={formData.subject_tags}
                    onChange={handleChange}
                    placeholder="Ex: Analise Matematica, Algebra Linear, Mecanica"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#18111e] border border-orange/20 rounded-2xl focus:border-orange/50 focus:ring-4 focus:ring-orange/15 outline-none transition-all font-semibold text-white placeholder:text-white/30 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-orange px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 disabled:opacity-70"
          >
            {saving ? (
              <>A Guardar...</>
            ) : (
              <>
                <Save className="w-5 h-5" /> Atualizar Perfil
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
