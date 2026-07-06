"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { MessageSquare, Trash2, CheckCircle2, Search, Filter, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminForum() {
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Modals
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; postId: number; title: string } | null>(null);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      let url = '/forum?limit=100';
      if (filterCategory !== 'all') {
        url += `&category=${filterCategory}`;
      }
      
      const [postsRes, statsRes] = await Promise.all([
        api.get(url, { headers }),
        api.get('/admin/forum-stats', { headers }).catch(() => ({ data: [] }))
      ]);
      
      setPosts(postsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Erro ao carregar forum", err);
      showToast("Erro ao carregar tópicos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterCategory]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const executeDelete = async () => {
    if (!confirmModal) return;
    const { postId } = confirmModal;
    setConfirmModal(null);
    
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/forum/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Tópico apagado com sucesso.");
      fetchPosts();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Erro ao apagar tópico.", "error");
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.author.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans relative">
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl border font-bold shadow-xl flex items-center gap-3 ${
              toastMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal?.show && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1c1422] border border-white/10 max-w-md w-full p-6 rounded-2xl shadow-2xl text-center space-y-6"
            >
              <h3 className="text-xl font-black text-white">Remover Tópico?</h3>
              <p className="text-white/70 text-sm">
                Tens a certeza que desejas apagar o tópico <strong className="text-white">"{confirmModal.title}"</strong>?
                Isso removerá também todos os comentários associados.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 border border-white/20 text-white/70 rounded-xl font-bold hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={executeDelete} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-md transition-colors bg-red-500 hover:bg-red-600`}>
                  Remover
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-title">Gestão do Fórum</h1>
          <p className="text-white/50 text-sm">Controle de qualidade e métricas de interação.</p>
        </div>
      </div>

      {/* FORUM STATS CHART */}
      <div className="bg-[#130a18] border border-white/5 p-6 rounded-2xl flex flex-col mb-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
           <Activity className="w-5 h-5 text-pink-400" />
           Atividade Semanal (Posts e Respostas)
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ backgroundColor: '#1c1422', borderColor: '#ffffff10', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="Posts" fill="#f472b6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Respostas" fill="#c084fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full sm:w-auto pb-2 sm:pb-0">
           {['all', 'duvidas', 'dicas', 'noticias', 'orientacao'].map((cat) => (
             <button
               key={cat}
               onClick={() => setFilterCategory(cat)}
               className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                 filterCategory === cat 
                 ? 'bg-orange text-white shadow-[0_0_10px_rgba(255,107,0,0.5)]' 
                 : 'bg-[#130a18] border border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
               }`}
             >
               {cat === 'all' ? 'Todas Categorias' : cat === 'duvidas' ? 'Dúvidas' : cat === 'dicas' ? 'Dicas & Materiais' : cat === 'noticias' ? 'Notícias' : 'Orientação Vocacional'}
             </button>
           ))}
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
           <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
           <input
             type="text"
             placeholder="Procurar tópico ou autor..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-[#130a18] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange"
           />
        </div>
      </div>

      <div className="bg-[#130a18] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Tópico & Conteúdo</th>
                <th className="p-4">Autor</th>
                <th className="p-4">Status/Engajamento</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/50 font-medium">A carregar tópicos...</td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/50 font-medium">Nenhum tópico encontrado.</td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 max-w-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold shrink-0 mt-1">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">{post.title}</p>
                          <p className="text-xs text-white/40 line-clamp-2 mt-1">{post.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] uppercase font-bold text-white/50">
                               {post.category}
                             </span>
                             <span className="text-[10px] text-white/30">
                               {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                             </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-orange/20 text-orange flex items-center justify-center text-xs font-bold">
                            {post.author.full_name.charAt(0)}
                         </div>
                         <div className="text-xs">
                            <p className="text-white font-bold">{post.author.full_name}</p>
                            <p className="text-white/40">{post.author.role}</p>
                         </div>
                       </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-white/60"><strong className="text-white">{post.likes}</strong> Likes</span>
                        <span className="text-white/60"><strong className="text-white">{post.comments?.length || 0}</strong> Respostas</span>
                        {post.is_call && (
                           <span className={`px-2 py-0.5 mt-1 rounded inline-block w-max font-bold text-[10px] uppercase ${post.call_status === 'live' ? 'bg-red-500/20 text-red-400' : post.call_status === 'ended' ? 'bg-white/10 text-white/50' : 'bg-blue-500/20 text-blue-400'}`}>
                              Call: {post.call_status}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right align-top">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                         <button
                           onClick={() => setConfirmModal({ show: true, postId: post.id, title: post.title })}
                           className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                           title="Remover Tópico"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
