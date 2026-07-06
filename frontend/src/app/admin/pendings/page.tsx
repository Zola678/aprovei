"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Shield, CheckCircle2, XCircle, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPendings() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; userId: number; userName: string; action: 'approve' | 'reject' } | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/auth/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for pending teachers
      setUsers(res.data.filter((u: any) => u.role === 'teacher' && (u.status === 'pending_interview' || u.status === 'pending_approval')));
    } catch (err) {
      console.error("Erro ao carregar utilizadores", err);
      showToast("Erro ao carregar dados.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const executeAction = async () => {
    if (!confirmModal) return;
    const { userId, action } = confirmModal;
    setConfirmModal(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'approve') {
        const formData = new FormData();
        formData.append('status', 'active');
        // Let's reuse role endpoint logic but we don't have a status endpoint.
        // We need an endpoint for status, but role="teacher" already activates them in our backend.
        // Actually our backend /admin/users/{id}/role sets status="active" if role="teacher".
        formData.append('role', 'teacher');
        await api.patch(`/auth/admin/users/${userId}/role`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Explicador aprovado e ativado com sucesso.");
      } 
      else if (action === 'reject') {
        // Just delete the user or change role to student
        await api.delete(`/auth/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Candidatura rejeitada.");
      }
      
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Ocorreu um erro na ação.", "error");
    }
  };

  return (
    <div className="space-y-6 font-sans">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1c1422] border border-white/10 max-w-md w-full p-6 rounded-2xl shadow-2xl text-center space-y-6"
            >
              <h3 className="text-xl font-black text-white">Confirmar {confirmModal.action === 'approve' ? 'Aprovação' : 'Rejeição'}</h3>
              <p className="text-white/70 text-sm">
                Tens a certeza que desejas {confirmModal.action === 'approve' ? 'aprovar' : 'rejeitar'} o explicador <strong className="text-white">{confirmModal.userName}</strong>?
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 border border-white/20 text-white/70 rounded-xl font-bold hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={executeAction} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-md transition-colors ${confirmModal.action === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-title">Aprovações Pendentes</h1>
          <p className="text-white/50 text-sm">Analise as candidaturas de novos explicadores.</p>
        </div>
      </div>

      <div className="bg-[#130a18] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Candidato</th>
                <th className="p-4">Fase</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-white/50 font-medium">A carregar dados...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-white/50 font-medium">Nenhum explicador pendente.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{u.full_name}</p>
                          <p className="text-xs text-white/40">{u.email} • {u.phone || 'Sem telefone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.status === 'pending_interview' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                         {u.status === 'pending_interview' ? 'Entrevista Automática' : 'Revisão Final'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button
                           onClick={() => setConfirmModal({ show: true, userId: u.id, userName: u.full_name, action: 'approve' })}
                           className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors border border-green-500/20"
                           title="Aprovar"
                         >
                           <CheckCircle2 className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => setConfirmModal({ show: true, userId: u.id, userName: u.full_name, action: 'reject' })}
                           className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-red-500/20"
                           title="Rejeitar Candidatura"
                         >
                           <XCircle className="w-4 h-4" />
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
