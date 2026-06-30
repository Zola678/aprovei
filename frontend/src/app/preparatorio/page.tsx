"use client";
import React, { useState, useEffect } from 'react';
import { Video, MapPin, Calendar, BookOpen, CheckCircle, ShieldAlert, Award, FileText, Sparkles, Plus, RefreshCw, Check, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function PreparatorioPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]); // Para estudantes verem suas inscrições
  const [teacherEnrollments, setTeacherEnrollments] = useState<any[]>([]); // Para professores moderarem
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Form states para criar turma
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClassData, setNewClassData] = useState({
    name: '',
    description: '',
    subject: '',
    price: 0
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchData(storedToken, parsedUser);
    } else {
      fetchClassroomsOnly();
    }
  }, []);

  const fetchClassroomsOnly = async () => {
    try {
      const res = await api.get('/classrooms');
      setClassrooms(res.data);
    } catch (err) {
      console.error("Erro ao obter turmas", err);
    }
  };

  const fetchData = async (authToken: string, currentUser: any) => {
    setLoading(true);
    try {
      const classRes = await api.get('/classrooms');
      setClassrooms(classRes.data);

      if (currentUser.role === 'student') {
        const myEnrollRes = await api.get('/classrooms/student/my-classes', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setEnrollments(myEnrollRes.data);
      } else if (currentUser.role === 'teacher') {
        const teacherEnrollRes = await api.get('/classrooms/teacher/enrollments', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setTeacherEnrollments(teacherEnrollRes.data);
      }
    } catch (err) {
      console.error("Erro ao obter dados de turmas/matrículas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post('/classrooms', newClassData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Turma virtual criada com sucesso!");
      setShowCreateForm(false);
      setNewClassData({ name: '', description: '', subject: '', price: 0 });
      if (token && user) fetchData(token, user);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Erro ao criar turma virtual.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (classroomId: number) => {
    if (!token) {
      alert("Precisas de fazer login para te matriculares numa turma.");
      return;
    }
    setActionLoading(classroomId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await api.post(`/classrooms/${classroomId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Matrícula solicitada com sucesso! Aguarda a aceitação do professor.");
      if (token && user) fetchData(token, user);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Erro ao solicitar matrícula.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveEnrollment = async (enrollmentId: number) => {
    setActionLoading(enrollmentId);
    try {
      await api.post(`/classrooms/enrollments/${enrollmentId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Matrícula de aluno aprovada!");
      if (token && user) fetchData(token, user);
    } catch (err: any) {
      setErrorMsg("Erro ao aprovar matrícula.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEnrollment = async (enrollmentId: number) => {
    if (!confirm("Desejas mesmo rejeitar esta inscrição de aluno?")) return;
    setActionLoading(enrollmentId);
    try {
      await api.post(`/classrooms/enrollments/${enrollmentId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Matrícula de aluno rejeitada.");
      if (token && user) fetchData(token, user);
    } catch (err: any) {
      setErrorMsg("Erro ao rejeitar matrícula.");
    } finally {
      setActionLoading(null);
    }
  };

  const isTeacher = user && user.role === 'teacher';
  const isStudent = user && user.role === 'student';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
  };

  return (
    <div className="space-y-16 pb-24 overflow-hidden relative z-10 px-4 md:px-8 max-w-[1600px] mx-auto text-left font-sans">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-lilac-light/15 rounded-full filter blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-orange/5 rounded-full filter blur-[100px] -z-10 pointer-events-none"></div>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-10"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lilac-base/30 text-white text-sm font-bold border border-lilac-light/20 shadow-[0_0_15px_rgba(123,79,166,0.2)] backdrop-blur-md mb-4">
            <Award className="w-5 h-5 text-orange animate-pulse" />
            <span>Matrículas Abertas para o Ano Académico 2026</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight font-title">
            Turmas de <span className="text-orange-glow">Preparatório</span>
          </h1>
          <p className="text-white/70 font-medium max-w-2xl mt-3 text-base md:text-lg">
            Matricula-te em turmas digitais lideradas por professores reais.
          </p>
        </div>

        {isTeacher && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange text-lilac-dark px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange/80 shadow-[0_0_15px_rgba(255,107,0,0.35)] transition-all transform hover:-translate-y-0.5 text-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Nova Turma</span>
          </button>
        )}
      </motion.section>

      {/* Alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl flex items-center gap-3 font-bold shadow-sm"
          >
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 font-bold shadow-sm"
          >
            <CheckCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Classroom Modal/Form */}
      <AnimatePresence>
        {showCreateForm && isTeacher && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-xl p-8 rounded-[2rem] space-y-6"
          >
            <h3 className="text-2xl font-black text-white font-title flex items-center gap-2">
              <Plus className="w-6 h-6 text-orange" />
              <span>Criar Nova Turma Virtual</span>
            </h3>
            <form onSubmit={handleCreateClassroom} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Nome da Turma</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Turma A de Álgebra UAN 2026"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm"
                  value={newClassData.name}
                  onChange={e => setNewClassData({ ...newClassData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Matéria / Cadeira</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matemática Geral, Física"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm"
                  value={newClassData.subject}
                  onChange={e => setNewClassData({ ...newClassData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Preço da Inscrição (Kz)</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Ex: 5000"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm"
                  value={newClassData.price}
                  onChange={e => setNewClassData({ ...newClassData, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Apresentação / Descrição da Turma</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Esta turma é focada na resolução das provas anteriores de Matemática da faculdade de Engenharia."
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm resize-none"
                  value={newClassData.description}
                  onChange={e => setNewClassData({ ...newClassData, description: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border border-lilac-light/25 text-white/60 hover:text-white rounded-xl text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-orange text-lilac-dark rounded-xl text-sm font-bold hover:bg-orange/80 shadow-sm transition-all"
                >
                  {loading ? "Processando..." : "Salvar Turma"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Se for professor: Ver solicitações de Matrículas */}
      {isTeacher && teacherEnrollments.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 font-title border-b border-white/10 pb-4">
            <span>📋 Moderar Matrículas Solicitadas ({teacherEnrollments.filter(e => e.status === 'pending_approval').length})</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {teacherEnrollments.map((enr: any) => (
              <div key={enr.id} className="bg-lilac-dark/45 border border-white/10 p-6 rounded-2xl flex justify-between items-start gap-4 shadow-sm">
                <div>
                  <h4 className="font-bold text-white text-lg">{enr.student?.full_name || 'Estudante'}</h4>
                  <p className="text-xs text-white/50">{enr.student?.email}</p>
                  <div className="mt-3 text-xs bg-white/5 p-3 rounded-lg border border-white/5 text-white/70">
                    <p><strong>Turma:</strong> {enr.classroom?.name}</p>
                    <p><strong>Matéria:</strong> {enr.classroom?.subject}</p>
                    <p className="text-orange font-bold"><strong>Valor:</strong> {Number(enr.classroom?.price).toLocaleString()} Kz</p>
                  </div>
                  {enr.status === 'pending_approval' && (
                    <span className="inline-block mt-3 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-amber-400 font-bold text-[10px] uppercase">
                      Aguardando Comprovativo
                    </span>
                  )}
                  {enr.status === 'approved' && (
                    <span className="inline-block mt-3 px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-[10px] uppercase">
                      Matrícula Ativa
                    </span>
                  )}
                </div>

                {enr.status === 'pending_approval' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveEnrollment(enr.id)}
                      className="bg-green-500 text-lilac-dark p-2.5 rounded-xl hover:bg-green-400 transition-all flex items-center justify-center font-bold text-xs"
                      title="Aceitar Aluno"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRejectEnrollment(enr.id)}
                      className="bg-rose-950/60 border border-rose-800/40 text-rose-300 p-2.5 rounded-xl hover:bg-rose-900 transition-all flex items-center justify-center font-bold text-xs"
                      title="Rejeitar Aluno"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista de Turmas Virtuais */}
      <section className="space-y-12">
        <div className="border-l-4 border-orange pl-6 py-2">
          <h2 className="text-3xl font-black text-white flex items-center gap-3 font-title">
            <div className="p-2 bg-orange/10 rounded-xl border border-orange/20">
              <Video className="w-8 h-8 text-orange" />
            </div>
            <span>Turmas Virtuais Disponíveis</span>
          </h2>
          <p className="text-white/60 text-lg font-medium mt-2">Encontra turmas ao vivo e de reforço geridas pelos nossos explicadores.</p>
        </div>

        {classrooms.length === 0 ? (
          <div className="text-center py-20 card-lilac-glass bg-lilac-base/10 border-lilac-light/20 rounded-[2rem]">
            <p className="text-white/50 font-semibold italic">Nenhuma turma virtual cadastrada no momento.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {classrooms.map((c: any) => {
              const hasEnrollment = enrollments.find(e => e.classroom_id === c.id);
              const enrollmentStatus = hasEnrollment ? hasEnrollment.status : null;

              return (
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  key={c.id} 
                  className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 hover:border-orange/30 shadow-lg relative flex flex-col justify-between overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange to-amber-500"></div>
                  
                  <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <span className="bg-orange/10 text-orange border border-orange/20 text-[10px] px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider">
                          {c.subject}
                        </span>
                        <h3 className="text-2xl font-black text-white leading-snug group-hover:text-orange transition-colors font-title">
                          {c.name}
                        </h3>
                        <p className="text-xs text-white/50 font-bold">Lecionado por: Prof. {c.teacher?.full_name || 'Explicador Aprovei'}</p>
                      </div>

                      <p className="text-sm text-white/70 leading-relaxed font-medium line-clamp-3">
                        {c.description}
                      </p>
                    </div>

                    <div className="pt-4 space-y-4">
                      <div className="flex items-baseline gap-1 border-t border-white/10 pt-4">
                        <span className="text-3xl font-black text-white">{Number(c.price).toLocaleString()} Kz</span>
                        <span className="text-sm font-bold text-white/50">/ Inscrição</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-lilac-dark/40 border-t border-lilac-light/20">
                    {/* Botões do fluxo de inscrição/matrícula */}
                    {isStudent ? (
                      enrollmentStatus === 'approved' ? (
                        <div className="w-full bg-green-500/10 border border-green-500/25 text-green-400 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Matriculado na Turma</span>
                        </div>
                      ) : enrollmentStatus === 'pending_approval' || enrollmentStatus === 'pending_payment' ? (
                        <div className="w-full bg-amber-400/10 border border-amber-400/25 text-amber-400 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Aguardando Confirmação</span>
                        </div>
                      ) : enrollmentStatus === 'rejected' ? (
                        <div className="w-full bg-rose-500/10 border border-rose-500/25 text-rose-400 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                          <span>Matrícula Recusada</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnroll(c.id)}
                          disabled={actionLoading === c.id}
                          className="block w-full bg-orange hover:bg-orange/90 text-lilac-dark text-center py-3.5 rounded-xl font-bold transition-all text-sm transform group-hover:scale-[1.02] shadow-[0_0_15px_rgba(255,107,0,0.35)]"
                        >
                          {actionLoading === c.id ? "Inscrevendo..." : "Matricular-me Online"}
                        </button>
                      )
                    ) : isTeacher ? (
                      <div className="w-full bg-white/5 border border-white/10 text-white/50 py-3.5 rounded-xl font-bold text-sm text-center">
                        Visualização de Explicador
                      </div>
                    ) : (
                      <a
                        href="/auth/login"
                        className="block w-full bg-orange text-lilac-dark text-center py-3.5 rounded-xl font-bold hover:bg-orange/90 transition-all text-sm"
                      >
                        Matricular-me Online
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Recursos e Benefícios */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 p-10 md:p-16 shadow-2xl grid gap-12 md:grid-cols-2 items-center relative overflow-hidden"
      >
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-orange/5 rounded-full blur-3xl"></div>

        <div className="space-y-6 relative z-10 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange text-sm font-bold border border-orange/20">
            <CheckCircle className="w-4 h-4" />
            <span>Benefícios Inclusos</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight font-title">
            O que está incluído no <span className="text-orange-glow">Preparatório Aprovei?</span>
          </h3>
          <p className="text-white/70 text-lg font-medium leading-relaxed">
            O nosso plano pedagógico foi construído especificamente para superar as fragilidades comuns no ensino secundário angolano. O foco está na prática repetida e na auto-avaliação.
          </p>
          <div className="grid gap-4 pt-4">
            {[
              "Garantia de atualização conforme os editais oficiais de 2026",
              "Material de apoio físico entregue em casa ou no polo",
              "Mini-simulados diários pelo WhatsApp",
              "Apoio emocional com psicólogos e ex-alunos admitidos"
            ].map((text, i) => (
              <motion.div 
                whileHover={{ x: 5 }}
                key={i} 
                className="flex items-center gap-3 text-sm text-white/90 font-bold bg-lilac-dark/40 p-3 rounded-xl border border-lilac-light/10 shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-orange shrink-0" />
                <span>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-lilac-dark/50 p-8 rounded-[2rem] border border-lilac-light/25 space-y-6 shadow-2xl text-center relative z-10"
        >
          <div className="w-20 h-20 mx-auto bg-orange/10 border border-orange/20 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-orange animate-pulse" />
          </div>
          <h4 className="text-2xl font-black text-white font-title">Bolsas APROVEI</h4>
          <p className="text-white/60 font-medium leading-relaxed">
            Oferecemos bolsas de estudos de 100% de desconto para estudantes de famílias vulneráveis ou com excelente desempenho académico no Ensino Médio. As candidaturas abrem trimestralmente.
          </p>
          <a
            href="/forum"
            className="inline-flex items-center gap-2 justify-center w-full py-4 px-6 bg-orange/10 text-orange border border-orange/20 font-bold rounded-xl hover:bg-orange hover:text-lilac-dark transition-colors text-sm"
          >
            <span>Saber mais sobre as bolsas</span>
            <Award className="w-4 h-4" />
          </a>
        </motion.div>
      </motion.section>
    </div>
  );
}
