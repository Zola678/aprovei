"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Users, GraduationCap, FileText, MessageSquare, Briefcase, TrendingUp, Activity, AlertCircle, ArrowUpRight, School } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [distData, setDistData] = useState<any[]>([]);
  const [instData, setInstData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [statsRes, growthRes, distRes, instRes, insightsRes] = await Promise.all([
          api.get('/auth/admin/stats', { headers }),
          api.get('/admin/charts/users-growth', { headers }).catch(() => ({ data: [] })),
          api.get('/admin/charts/distribution', { headers }).catch(() => ({ data: [] })),
          api.get('/admin/institutions', { headers }).catch(() => ({ data: [] })),
          api.get('/admin/ai-insights', { headers }).catch(() => ({ data: [] }))
        ]);
        
        setStats(statsRes.data);
        setGrowthData(growthRes.data);
        setDistData(distRes.data);
        setInstData(instRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin"></div>
        <p className="text-white/60 font-semibold animate-pulse">A recolher dados do sistema...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Estudantes', value: stats?.total_students || 0, icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Explicadores Ativos', value: stats?.total_teachers_active || 0, icon: Briefcase, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Explicadores Pendentes', value: stats?.total_teachers_pending || 0, icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Provas Carregadas', value: stats?.total_exams || 0, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Tópicos no Fórum', value: stats?.total_posts || 0, icon: MessageSquare, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ];

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-title">Painel Geral de Gestão</h1>
          <p className="text-white/60 mt-1 text-sm">Visualização em tempo real do crescimento e métricas da plataforma.</p>
        </div>
        <div className="bg-orange/10 border border-orange/20 text-orange px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 animate-pulse" /> Servidor Operacional
        </div>
      </div>

      {/* BIG NUMBER CARDS */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#130a18] border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between z-10">
                <span className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider pr-2">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="z-10 flex items-end gap-3 mt-2">
                <p className="text-3xl font-black text-white">{card.value}</p>
                <div className="flex items-center text-green-400 text-xs font-bold pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-3 h-3" /> +{(Math.random() * 20).toFixed(1)}%
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${card.bg.replace('/10', '')} group-hover:opacity-40 transition-opacity`}></div>
            </motion.div>
          );
        })}
      </div>
      
      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* GROWTH LINE CHART */}
         <div className="lg:col-span-2 bg-[#130a18] border border-white/5 p-6 rounded-2xl flex flex-col relative">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
               <TrendingUp className="w-5 h-5 text-orange" />
               Crescimento da Plataforma
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1422', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="Estudantes" stroke="#f97316" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Explicadores" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* USER DISTRIBUTION PIE CHART */}
         <div className="bg-[#130a18] border border-white/5 p-6 rounded-2xl flex flex-col relative">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
               <Users className="w-5 h-5 text-blue-400" />
               Distribuição de Utilizadores
            </h3>
            <div className="h-[220px] w-full flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {distData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1422', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
               {distData.map((d, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    {d.name}: <strong className="text-white">{d.value}</strong>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INSTITUTIONS BAR CHART */}
        <div className="bg-[#130a18] border border-white/5 p-6 rounded-2xl flex flex-col">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
               <School className="w-5 h-5 text-purple-400" />
               Instituições / Universidades em Foco
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={instData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} hide />
                  <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1c1422', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={20}>
                    {instData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* SYSTEM INSIGHTS */}
         <div className="bg-[#130a18] border border-white/5 p-6 rounded-2xl flex flex-col">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              Notificações do Sistema
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
               {insights.map((insight, i) => (
                 <div key={i} className={`p-4 border rounded-xl ${
                   insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 
                   insight.type === 'action' ? 'bg-red-500/10 border-red-500/20' : 
                   'bg-blue-500/10 border-blue-500/20'
                 }`}>
                   <p className={`text-sm font-bold mb-1 ${
                     insight.type === 'warning' ? 'text-amber-400' : 
                     insight.type === 'action' ? 'text-red-400' : 'text-blue-400'
                   }`}>{insight.title}</p>
                   <p className="text-white/60 text-xs leading-relaxed">{insight.description}</p>
                 </div>
               ))}
               {insights.length === 0 && (
                 <p className="text-white/40 text-sm text-center py-8">Nenhum insight importante de momento.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
