"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Cpu, Server, Activity, Database, Sparkles, BrainCircuit, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminAI() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/admin/ai-insights', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInsights(res.data);
      } catch (err) {
        console.error("Erro ao carregar insights IA", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAI();
  }, []);

  const handleAction = async (title: string) => {
    // This is a placeholder for future AI agent actions
    alert(`Ação "${title}" solicitada. A Inteligência Artificial irá processar este comando brevemente.`);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-title flex items-center gap-2">
             <BrainCircuit className="w-8 h-8 text-orange" />
             AIA <span className="text-sm font-medium text-white/50">(Assistente Inteligente do Administrador)</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">A AIA monitoriza o sistema em tempo real e fornece recomendações de gestão baseadas em dados.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-[#130a18] border border-white/5 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
               <Cpu className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-white/50 font-bold uppercase">Estado da IA</p>
               <p className="text-white font-bold">Ativa e Operante</p>
            </div>
         </div>
         <div className="bg-[#130a18] border border-white/5 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
               <Server className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-white/50 font-bold uppercase">Carga do Servidor</p>
               <p className="text-white font-bold">Normal (12%)</p>
            </div>
         </div>
         <div className="bg-[#130a18] border border-white/5 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
               <Database className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-white/50 font-bold uppercase">Saúde da BD</p>
               <p className="text-white font-bold">Otimizada</p>
            </div>
         </div>
         <div className="bg-[#130a18] border border-white/5 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-orange/10 rounded-lg text-orange">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <p className="text-xs text-white/50 font-bold uppercase">Modelos de IA</p>
               <p className="text-white font-bold">Gemini 1.5 Pro</p>
            </div>
         </div>
      </div>

      <div className="bg-gradient-to-br from-[#130a18] to-[#1c1422] border border-orange/20 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <Sparkles className="w-64 h-64 text-orange" />
        </div>
        
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
           <Zap className="w-5 h-5 text-orange" /> Recomendações da AIA
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
             <div className="w-8 h-8 border-2 border-orange/20 border-t-orange rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid gap-4 relative z-10">
            {insights.length === 0 ? (
               <p className="text-white/50">O sistema está perfeitamente equilibrado neste momento. Nenhuma recomendação.</p>
            ) : (
               insights.map((insight, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                     insight.type === 'action' ? 'bg-orange/5 border-orange/20' : 
                     insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 
                     'bg-blue-500/5 border-blue-500/20'
                   }`}
                 >
                   <div>
                     <h3 className={`font-bold text-lg ${
                       insight.type === 'action' ? 'text-orange' : 
                       insight.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                     }`}>
                       {insight.title}
                     </h3>
                     <p className="text-white/70 text-sm mt-1">{insight.description}</p>
                   </div>
                   
                   {insight.type === 'action' && (
                      <button 
                        onClick={() => handleAction(insight.title)}
                        className="px-4 py-2 bg-orange hover:bg-orange/80 text-white rounded-lg text-sm font-bold shadow-lg transition-colors whitespace-nowrap flex items-center gap-2"
                      >
                         Executar Sugestão <ArrowRight className="w-4 h-4" />
                      </button>
                   )}
                   {insight.type === 'warning' && (
                      <button 
                        onClick={() => handleAction(insight.title)}
                        className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/50 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                      >
                         Ver Detalhes
                      </button>
                   )}
                 </motion.div>
               ))
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
         <div className="bg-[#130a18] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-white font-bold mb-2">Comandos da AIA (Em Breve)</h3>
            <p className="text-white/50 text-sm mb-4">No futuro, poderás dar comandos diretos à AIA, como "Apaga todas as contas inativas há mais de 1 ano" ou "Gera um relatório de vendas deste mês".</p>
            <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center text-white/30 text-sm font-mono">
               &gt; Aguardando input...
            </div>
         </div>
      </div>
    </div>
  );
}
