"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Shield, Trash2, Crown, CheckCircle2, User, Search, Plus, Edit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; userId: number; userName: string; action: 'delete' | 'role' | 'premium'; payload?: any } | null>(null);
  
  // Create / Edit User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({ email: '', full_name: '', phone: '', password: '', role: 'student', is_premium: false });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/auth/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Erro ao carregar utilizadores", err);
      showToast("Erro ao carregar utilizadores.", "error");
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
    const { userId, action, payload } = confirmModal;
    setConfirmModal(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'delete') {
        await api.delete(`/auth/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Utilizador apagado com sucesso.");
      } 
      else if (action === 'role') {
        const formData = new FormData();
        formData.append('role', payload.role);
        await api.patch(`/auth/admin/users/${userId}/role`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Cargo atualizado.");
      }
      else if (action === 'premium') {
        const formData = new FormData();
        formData.append('is_premium', payload.is_premium.toString());
        await api.patch(`/auth/admin/users/${userId}/premium`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Status premium atualizado.");
      }
      
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Ocorreu um erro na ação.", "error");
    }
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('email', formData.email);
      data.append('full_name', formData.full_name);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.password) data.append('password', formData.password);
      
      if (editingUser) {
        // Edit User
        await api.put(`/auth/admin/users/${editingUser.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // role and premium need their own endpoints per existing logic, or can be combined if API supports it, but API currently only updates email, name, phone, pass.
        // Let's do additional patches if they changed
        if (formData.role !== editingUser.role) {
          const roleData = new FormData();
          roleData.append('role', formData.role);
          await api.patch(`/auth/admin/users/${editingUser.id}/role`, roleData, { headers: { Authorization: `Bearer ${token}` } });
        }
        if (formData.is_premium !== editingUser.is_premium) {
          const premData = new FormData();
          premData.append('is_premium', formData.is_premium.toString());
          await api.patch(`/auth/admin/users/${editingUser.id}/premium`, premData, { headers: { Authorization: `Bearer ${token}` } });
        }
        showToast("Utilizador atualizado com sucesso.");
      } else {
        // Create User
        data.append('role', formData.role);
        data.append('is_premium', formData.is_premium.toString());
        if (!formData.password) data.append('password', 'Mudar123!'); // Default password if empty
        await api.post('/auth/admin/users', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Utilizador criado com sucesso.");
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Erro ao guardar utilizador.", "error");
    }
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      phone: user.phone || '',
      password: '',
      role: user.role,
      is_premium: user.is_premium
    });
    setShowUserModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', full_name: '', phone: '', password: '', role: 'student', is_premium: false });
    setShowUserModal(true);
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h3 className="text-xl font-black text-white">Confirmar Ação</h3>
              <p className="text-white/70 text-sm">
                Tens a certeza que desejas alterar <strong className="text-white">{confirmModal.userName}</strong>?
                {confirmModal.action === 'delete' && " Esta ação irá APAGAR PERMANENTEMENTE a conta."}
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 border border-white/20 text-white/70 rounded-xl font-bold hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={executeAction} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-md transition-colors ${confirmModal.action === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange hover:bg-orange/80'}`}>
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[#1c1422] border border-white/10 max-w-lg w-full p-6 rounded-2xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white">{editingUser ? 'Editar Utilizador' : 'Novo Utilizador'}</h3>
                <button onClick={() => setShowUserModal(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={saveUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-1">Nome Completo *</label>
                  <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-1">Telemóvel</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-1">Palavra-passe {editingUser && '(Opcional)'}</label>
                  <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? "Deixe em branco para não alterar" : "Senha"} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold text-white/70 mb-1">Cargo</label>
                      <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange">
                        <option value="student">Estudante</option>
                        <option value="teacher">Explicador</option>
                        <option value="admin">Administrador</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-white/70 mb-1">Premium?</label>
                      <select value={formData.is_premium ? 'true' : 'false'} onChange={e => setFormData({...formData, is_premium: e.target.value === 'true'})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange">
                        <option value="false">Gratuito</option>
                        <option value="true">Premium</option>
                      </select>
                   </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3 border border-white/20 text-white/70 rounded-xl font-bold hover:bg-white/5 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-orange text-white rounded-xl font-bold hover:bg-orange/80 transition-colors shadow-md">
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-title">Gestão de Utilizadores</h1>
          <p className="text-white/50 text-sm">Gere perfis, adicione novos membros e controle acessos.</p>
        </div>
        <div className="w-full md:w-auto flex items-center gap-3 relative">
          <div className="relative flex-1 md:w-64">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
             <input
               type="text"
               placeholder="Pesquisar..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-[#130a18] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange"
             />
          </div>
          <button onClick={openCreateModal} className="bg-orange/20 text-orange border border-orange/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange/30 transition flex items-center gap-2">
             <Plus className="w-4 h-4" />
             <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </div>

      <div className="bg-[#130a18] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Nome / Email</th>
                <th className="p-4">Cargo</th>
                <th className="p-4">Estatuto</th>
                <th className="p-4">XP</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50 font-medium">A carregar dados...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50 font-medium">Nenhum utilizador encontrado.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange/10 text-orange flex items-center justify-center font-bold text-xs shrink-0">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{u.full_name}</p>
                          <p className="text-xs text-white/40">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select 
                        value={u.role}
                        onChange={(e) => setConfirmModal({ show: true, userId: u.id, userName: u.full_name, action: 'role', payload: { role: e.target.value } })}
                        className="bg-black/40 border border-white/10 rounded-lg text-xs font-bold px-2 py-1.5 focus:outline-none focus:border-orange text-white"
                      >
                        <option value="student">Estudante</option>
                        <option value="teacher">Explicador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setConfirmModal({ show: true, userId: u.id, userName: u.full_name, action: 'premium', payload: { is_premium: !u.is_premium } })}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-colors ${u.is_premium ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                      >
                        <Crown className="w-3.5 h-3.5" />
                        {u.is_premium ? 'Premium' : 'Gratuito'}
                      </button>
                    </td>
                    <td className="p-4 text-sm font-bold text-white/70">
                      {u.xp || 0}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                         <button
                           onClick={() => openEditModal(u)}
                           className="p-2 text-white/50 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                           title="Editar Utilizador"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => setConfirmModal({ show: true, userId: u.id, userName: u.full_name, action: 'delete' })}
                           className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                           title="Remover Conta"
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
