"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, GraduationCap, FileText, MessageSquare, Briefcase, TrendingUp, Activity, AlertCircle, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/auth/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin"></div>
        <p className="text-white/60 font-semibold animate-pulse">A carregar estatísticas...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Estudantes', value: stats?.total_students || 0, icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Explicadores Ativos', value: stats?.total_teachers_active || 0, icon: Briefcase, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Explicadores (Pendentes)', value: stats?.total_teachers_pending || 0, icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Provas Carregadas', value: stats?.total_exams || 0, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Tópicos no Fórum', value: stats?.total_posts || 0, icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-title">Visão Geral</h1>
          <p className="text-white/60 mt-1 text-sm">Acompanhe estatísticas, estimativas e dados reais da plataforma.</p>
        </div>
        <div className="bg-orange/10 border border-orange/20 text-orange px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse" /> Sistema Operacional
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#130a18] border border-white/5 p-6 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between z-10">
                <span className="text-white/50 text-xs font-bold uppercase tracking-wider pr-4">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="z-10 flex items-end gap-3">
                <p className="text-4xl font-black text-white">{card.value}</p>
                <div className="flex items-center text-green-400 text-xs font-bold pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-3 h-3" /> +12%
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${card.bg.replace('/10', '')} group-hover:opacity-40 transition-opacity`}></div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Estimativas e Projeções */}
         <div className="lg:col-span-2 bg-[#130a18] border border-white/5 p-6 rounded-2xl h-80 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-orange" />
                 Estimativas & Crescimento (Real-Time)
              </h3>
              <select className="bg-black/40 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none">
                <option>Últimos 30 Dias</option>
                <option>Últimos 6 Meses</option>
                <option>Ano Atual</option>
              </select>
            </div>
            
            <div className="flex-1 border border-white/5 bg-black/20 rounded-xl flex items-end p-4 gap-2 relative">
               {/* Gráfico Simulado */}
               {[40, 65, 45, 80, 55, 90, 70, 110, 85, 120, 100, 140].map((h, i) => (
                 <div key={i} className="flex-1 bg-gradient-to-t from-orange/40 to-orange/10 rounded-t-sm hover:from-orange/60 transition-colors" style={{ height: `${(h / 140) * 100}%` }}></div>
               ))}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-white/50 text-sm font-medium">
                    Gráfico de Adoção da IA Integrado Brevemente
                 </div>
               </div>
            </div>
         </div>

         {/* Alertas e Insights */}
         <div className="bg-[#130a18] border border-white/5 p-6 rounded-2xl h-80 flex flex-col overflow-y-auto custom-scrollbar">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Insights do Sistema
            </h3>
            
            <div className="space-y-4 flex-1">
               <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                 <p className="text-red-400 text-sm font-bold mb-1">Candidaturas Pendentes</p>
                 <p className="text-white/60 text-xs">Existem {stats?.total_teachers_pending || 0} explicadores aguardando entrevista. Revise o painel de Utilizadores.</p>
               </div>
               <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                 <p className="text-blue-400 text-sm font-bold mb-1">Alta Atividade no Fórum</p>
                 <p className="text-white/60 text-xs">A categoria "Dúvidas" recebeu um aumento de 30% em tráfego nesta semana.</p>
               </div>
               <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                 <p className="text-green-400 text-sm font-bold mb-1">Crescimento de Premium</p>
                 <p className="text-white/60 text-xs">A conversão para contas premium aumentou. Excelente retenção!</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
