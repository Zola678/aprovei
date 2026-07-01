"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import api, { getStorageUrl } from '@/lib/api';

export default function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTeachers, setActiveTeachers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'students' | 'teachers'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // States para Toasts e Confirmações Personalizados (Evitando alert/confirm nativos)
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; userId: number; candidateName: string } | null>(null);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, pendingRes, studentsRes, activeTeachersRes] = await Promise.all([
        api.get('/auth/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/teachers/admin/pending', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/auth/admin/students', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/auth/admin/teachers/active', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setPending(pendingRes.data);
      setStudents(studentsRes.data);
      setActiveTeachers(activeTeachersRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados do admin", err);
      showToast("Erro ao carregar dados do painel.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/teachers/admin/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Professor aprovado com sucesso!", "success");
      fetchAdminData();
    } catch (err) {
      showToast("Erro ao aprovar professor.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = (userId: number, name: string) => {
    setConfirmModal({
      show: true,
      userId,
      candidateName: name
    });
  };

  const handleReject = async () => {
    if (!confirmModal) return;
    const { userId } = confirmModal;
    setConfirmModal(null);
    setActionLoading(userId);
    
    try {
      const token = localStorage.getItem('token');
      await api.post(`/teachers/admin/${userId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Candidatura rejeitada e dados excluídos.", "success");
      fetchAdminData();
    } catch (err) {
      showToast("Erro ao rejeitar candidatura.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin"></div>
        <p className="text-white/60 font-semibold animate-pulse">A carregar Painel de Administração...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 px-4 sm:px-0 pt-6 sm:pt-0 text-left font-sans">
      
      {/* Dynamic Toast Notification */}
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
            <Check className="w-5 h-5 shrink-0" />
            <span>{toastMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal?.show && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-lilac-dark/65 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-lilac-glass border-lilac-light/35 bg-lilac-base/95 max-w-md w-full p-8 shadow-2xl space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white font-title">Confirmar Rejeição</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Tens a certeza que desejas rejeitar a candidatura de <strong className="text-white">{confirmModal.candidateName}</strong>? Todos os dados dele serão apagados permanentemente por privacidade.
                </p>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 border border-lilac-light/25 text-white/70 hover:text-white rounded-xl text-sm font-bold hover:bg-white/5 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-all shadow-md"
                >
                  Rejeitar e Apagar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] gap-4 backdrop-blur-2xl">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Painel do Administrador 🛡️</h2>
          <p className="text-white/60">Controle total do ecossistema Aprovei.</p>
        </div>
        <span className="px-4 py-2 rounded-full bg-orange/10 border border-orange/25 text-orange font-bold text-sm">
          Sessão: {user.full_name}
        </span>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Estudantes</h4>
          <p className="text-3xl font-black text-white mt-2">{stats?.total_students || 0}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Explicadores Ativos</h4>
          <p className="text-3xl font-black text-orange mt-2">{stats?.total_teachers_active || 0}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Candidaturas Pendentes</h4>
          <p className="text-3xl font-black text-amber-400 mt-2">{stats?.total_teachers_pending || 0}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Provas no Sistema</h4>
          <p className="text-3xl font-black text-white mt-2">{stats?.total_exams || 0}</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Atividade no Fórum</h4>
          <p className="text-3xl font-black text-white mt-2">{stats?.total_posts || 0} posts</p>
        </div>
      </div>

      {/* Navegação por Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar pb-2 sm:pb-0 border-b border-white/10 gap-4 sm:gap-6 whitespace-nowrap">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 text-base md:text-lg font-bold border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-orange text-orange'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Candidaturas Pendentes ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-4 text-base md:text-lg font-bold border-b-2 transition-all ${
            activeTab === 'students'
              ? 'border-orange text-orange'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Estudantes Registados ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-4 text-base md:text-lg font-bold border-b-2 transition-all ${
            activeTab === 'teachers'
              ? 'border-orange text-orange'
              : 'border-transparent text-white/50 hover:text-white'
          }`}
        >
          Explicadores Ativos ({activeTeachers.length})
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div>
        {activeTab === 'pending' && (
          <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
              <span>📋 Fila de Avaliação de Explicadores</span>
            </h3>

            {pending.length === 0 ? (
              <p className="text-white/55 font-medium py-8 text-center border border-dashed border-white/10 rounded-2xl">
                Nenhuma candidatura pendente no momento. Bom trabalho!
              </p>
            ) : (
              <div className="space-y-6">
                {pending.map((candidate) => (
                  <div key={candidate.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex flex-col xl:flex-row gap-4 sm:gap-6 justify-between items-start">
                    <div className="flex gap-3 sm:gap-4 items-start flex-1 min-w-0 w-full">
                      {candidate.photo_url && candidate.photo_url !== "null" && candidate.photo_url !== "undefined" ? (
                        <img 
                          src={getStorageUrl(candidate.photo_url)} 
                          alt={candidate.full_name} 
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-orange/40 shadow-lg shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-orange/10 border-2 border-orange/20 rounded-2xl shrink-0 flex items-center justify-center text-orange font-bold">
                          Sem Foto
                        </div>
                      )}
                      
                      <div className="space-y-2 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xl font-bold text-white">{candidate.full_name}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                            candidate.status === 'pending_approval' 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-400/10 border border-amber-400/20 text-amber-400'
                          }`}>
                            {candidate.status === 'pending_approval' ? 'Entrevista Concluída' : 'Fase de Entrevista'}
                          </span>
                        </div>
                        <p className="text-sm text-white/50">{candidate.email} | {candidate.phone}</p>
                        {candidate.status === 'pending_approval' ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm pt-2">
                              <p className="text-white/70"><strong>Cadeira:</strong> {candidate.profile?.specialty}</p>
                              <p className="text-white/70"><strong>Preço/Hora:</strong> {candidate.profile?.price_per_hour} Kz</p>
                              <p className="text-white/70"><strong>Localização:</strong> {candidate.profile?.location}</p>
                              <p className="text-white/70"><strong>Anos de Exp:</strong> {candidate.years_of_experience} anos</p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 mt-4 text-sm text-white/80">
                              <p><strong>Experiência:</strong> {candidate.experience}</p>
                              <p><strong>Pretensões:</strong> {candidate.what_intends}</p>
                            </div>

                            {candidate.resume_pdf_url && (
                              <a 
                                href={getStorageUrl(candidate.resume_pdf_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-orange font-bold text-sm hover:underline pt-2"
                              >
                                <FileText className="w-4 h-4" /> Ver Currículo PDF anexado
                              </a>
                            )}
                          </>
                        ) : (
                          <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 text-sm text-white/60">
                            Este professor registou-se recentemente e ainda está a preencher os dados da candidatura (Fase de Entrevista).
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0 w-full xl:w-auto">
                      <button
                        disabled={actionLoading !== null || candidate.status === 'pending_interview'}
                        onClick={() => handleApprove(candidate.id)}
                        className={`flex-1 xl:flex-none px-4 sm:px-6 py-2.5 sm:py-3 font-bold rounded-xl text-sm transition-all ${
                          candidate.status === 'pending_interview'
                            ? 'bg-orange/20 text-orange/40 cursor-not-allowed border border-orange/10'
                            : 'btn-orange'
                        }`}
                      >
                        {actionLoading === candidate.id 
                          ? "A Processar..." 
                          : candidate.status === 'pending_interview' 
                            ? "Aguardando Entrevista" 
                            : "Aprovar Candidato"
                        }
                      </button>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleConfirmReject(candidate.id, candidate.full_name)}
                        className="flex-1 xl:flex-none bg-rose-950/60 border border-rose-800/40 text-rose-300 hover:bg-rose-900 px-4 sm:px-6 py-2.5 sm:py-3 font-bold rounded-xl text-sm transition-all"
                      >
                        Rejeitar & Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-white">🎓 Estudantes Registados no Sistema</h3>
            {students.length === 0 ? (
              <p className="text-white/55 font-medium py-8 text-center border border-dashed border-white/10 rounded-2xl">
                Nenhum estudante registado na base de dados.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-white/5 text-white/50 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 border-b border-white/10">Nome Completo</th>
                      <th className="p-4 border-b border-white/10">E-mail</th>
                      <th className="p-4 border-b border-white/10">Telefone</th>
                      <th className="p-4 border-b border-white/10">Plano de Acesso</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80 text-sm font-semibold divide-y divide-white/5">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">{student.full_name}</td>
                        <td className="p-4 text-white/60">{student.email}</td>
                        <td className="p-4 text-white/60">{student.phone || "Não informado"}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            student.is_premium 
                              ? 'bg-orange/10 border border-orange/20 text-orange shadow-sm'
                              : 'bg-white/5 border border-white/10 text-white/60'
                          }`}>
                            {student.is_premium ? 'Premium ⭐' : 'Gratuito 📚'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-white">👨‍🏫 Explicadores Ativos no Sistema</h3>
            {activeTeachers.length === 0 ? (
              <p className="text-white/55 font-medium py-8 text-center border border-dashed border-white/10 rounded-2xl">
                Nenhum explicador ativo na base de dados.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {activeTeachers.map((teacher) => (
                  <div key={teacher.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 flex gap-3 sm:gap-4 items-start min-w-0">
                    {teacher.photo_url && teacher.photo_url !== "null" && teacher.photo_url !== "undefined" ? (
                        <img 
                        src={getStorageUrl(teacher.photo_url)} 
                        alt={teacher.full_name} 
                        className="w-16 h-16 rounded-xl object-cover border border-orange/30 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-orange/10 border-orange/20 rounded-xl shrink-0 flex items-center justify-center text-orange font-bold font-title">
                        {teacher.full_name ? teacher.full_name.substring(0, 2).toUpperCase() : 'EX'}
                      </div>
                    )}
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-white leading-tight">{teacher.full_name}</h4>
                      <p className="text-xs text-white/40">{teacher.email} | {teacher.phone}</p>
                      <div className="text-sm pt-1 space-y-0.5">
                        <p className="text-white/70"><strong>Especialidade:</strong> {teacher.profile?.specialty}</p>
                        <p className="text-white/70"><strong>Preço/Hora:</strong> {teacher.profile?.price_per_hour} Kz</p>
                        <p className="text-white/70"><strong>Localização:</strong> {teacher.profile?.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
