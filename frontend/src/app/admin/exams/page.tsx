"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpen, Trash2, CheckCircle2, Search, Plus, Edit, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; examId: number; title: string; action: 'delete' } | null>(null);
  
  // Create / Edit Exam Modal
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ university: '', subject: '', year: 2026, category: 'acesso', description: '' });

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams?limit=100');
      setExams(res.data);
    } catch (err) {
      console.error("Erro ao carregar provas", err);
      showToast("Erro ao carregar provas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const executeAction = async () => {
    if (!confirmModal) return;
    const { examId, action } = confirmModal;
    setConfirmModal(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'delete') {
        await api.delete(`/exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Prova apagada com sucesso.");
      } 
      
      fetchExams();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Ocorreu um erro na ação.", "error");
    }
  };

  const saveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('university', formData.university);
      data.append('subject', formData.subject);
      data.append('year', formData.year.toString());
      data.append('category', formData.category);
      if (formData.description) data.append('description', formData.description);
      
      if (editingExam) {
        // Edit Exam
        await api.put(`/exams/${editingExam.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Prova atualizada com sucesso.");
      } else {
        // Create Exam
        if (!file) {
          showToast("O arquivo PDF é obrigatório.", "error");
          return;
        }
        data.append('file', file);
        await api.post('/exams/', data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        showToast("Prova enviada com sucesso.");
      }
      setShowModal(false);
      fetchExams();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Erro ao guardar prova.", "error");
    }
  };

  const openEditModal = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      university: exam.university,
      subject: exam.subject,
      year: exam.year,
      category: exam.category,
      description: exam.description || ''
    });
    setFile(null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingExam(null);
    setFormData({ university: '', subject: '', year: new Date().getFullYear(), category: 'acesso', description: '' });
    setFile(null);
    setShowModal(true);
  };

  const filteredExams = exams.filter(e => 
    e.university.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.subject.toLowerCase().includes(searchQuery.toLowerCase())
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
                Tens a certeza que desejas apagar a prova <strong className="text-white">{confirmModal.title}</strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 border border-white/20 text-white/70 rounded-xl font-bold hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={executeAction} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-md transition-colors bg-red-500 hover:bg-red-600`}>
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[#1c1422] border border-white/10 max-w-lg w-full p-6 rounded-2xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white">{editingExam ? 'Editar Prova' : 'Nova Prova'}</h3>
                <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={saveExam} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-1">Instituição / Univ *</label>
                    <input type="text" required value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} placeholder="Ex: UEM, UP" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange uppercase" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-1">Disciplina *</label>
                    <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="Ex: Matemática" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold text-white/70 mb-1">Ano *</label>
                      <input type="number" required value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-white/70 mb-1">Categoria *</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange">
                        <option value="acesso">Exame de Acesso</option>
                        <option value="exame_especial">Exame Especial</option>
                        <option value="nacional">Exame Nacional (10ª/12ª)</option>
                      </select>
                   </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-1">Descrição</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange min-h-24 resize-none"></textarea>
                </div>
                {!editingExam && (
                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-1">Arquivo PDF *</label>
                    <input type="file" accept="application/pdf" required onChange={e => setFile(e.target.files?.[0] || null)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange/20 file:text-orange hover:file:bg-orange/30" />
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-white/20 text-white/70 rounded-xl font-bold hover:bg-white/5 transition-colors">
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
          <h1 className="text-2xl font-black text-white font-title">Gestão de Provas</h1>
          <p className="text-white/50 text-sm">Organize a biblioteca de exames, adicione novos ou corrija detalhes.</p>
        </div>
        <div className="w-full md:w-auto flex items-center gap-3 relative">
          <div className="relative flex-1 md:w-64">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
             <input
               type="text"
               placeholder="Procurar Univ ou Disciplina..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-[#130a18] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange"
             />
          </div>
          <button onClick={openCreateModal} className="bg-orange/20 text-orange border border-orange/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange/30 transition flex items-center gap-2">
             <Plus className="w-4 h-4" />
             <span className="hidden sm:inline">Nova Prova</span>
          </button>
        </div>
      </div>

      <div className="bg-[#130a18] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 text-xs uppercase tracking-wider font-bold">
                <th className="p-4">Identificação</th>
                <th className="p-4">Categoria</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/50 font-medium">A carregar provas...</td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/50 font-medium">Nenhuma prova encontrada.</td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{exam.university} - {exam.subject} ({exam.year})</p>
                          <p className="text-xs text-white/40 truncate max-w-[200px]">{exam.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-bold text-white/60 capitalize">
                         {exam.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {exam.solved ? (
                         <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded-md text-xs font-bold flex items-center w-max gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Resolvida
                         </span>
                      ) : (
                         <span className="px-2 py-1 bg-amber-500/10 text-amber-400 rounded-md text-xs font-bold flex items-center w-max gap-1">
                            Pendente
                         </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                         {exam.pdf_url && (
                           <a
                             href={process.env.NEXT_PUBLIC_API_URL + exam.pdf_url}
                             target="_blank" rel="noopener noreferrer"
                             className="p-2 text-white/50 hover:text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                             title="Ver PDF"
                           >
                             <Download className="w-4 h-4" />
                           </a>
                         )}
                         <button
                           onClick={() => openEditModal(exam)}
                           className="p-2 text-white/50 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                           title="Editar Prova"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => setConfirmModal({ show: true, examId: exam.id, title: `${exam.university} - ${exam.subject} (${exam.year})`, action: 'delete' })}
                           className="p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                           title="Remover Prova"
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
