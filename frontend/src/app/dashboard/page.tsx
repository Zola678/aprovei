"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { getStorageUrl } from '@/lib/api';
import { BookOpen, Users, Compass, Award, Calendar, LogOut, CheckCircle, FileText, Play, ArrowRight, Activity, TrendingUp, Sparkles, Zap, Trophy, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useModule } from '@/context/ModuleContext';


export default function DashboardPage() {
  const router = useRouter();
  const { activeModule } = useModule();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/auth/login');
    } else {
      setUser(JSON.parse(storedUser));
      fetchTasks(token);
    }
  }, [router]);

  const fetchTasks = async (authToken: string) => {
    try {
      const res = await api.get('/study/tasks', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.log("Erro ao buscar tarefas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-orange/20 border-t-orange rounded-full animate-spin shadow-[0_0_15px_rgba(255,107,0,0.2)]"></div>
        <p className="text-white/60 font-semibold animate-pulse">A carregar o teu painel...</p>
      </div>
    );
  }

  if (!user) return null;

  // Roteamento condicional de Dashboards com base no Papel (Role) e Status do Utilizador
  if (user.role === 'admin') {
    return <AdminDashboard user={user} />;
  }

  if (user.role === 'teacher') {
    if (user.status === 'pending_interview') {
      return (
        <TeacherInterview 
          user={user} 
          onComplete={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }} 
        />
      );
    }
    if (user.status === 'pending_approval') {
      return <TeacherPendingApproval user={user} />;
    }
    return <TeacherDashboard user={user} />;
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length || 10;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 45;

  // --- DADOS DINÂMICOS COM BASE NO MÓDULO ATIVO ---
  const isHighSchool = activeModule === "high_school";

  const bookRecommendations = isHighSchool ? [
    { title: "Manual de Matemática - 10ª Classe", author: "Ministério da Educação", type: "10ª Classe", points: "+40 XP" },
    { title: "Apontamentos de Física - 11ª Classe", author: "Prof. Alberto Neto", type: "11ª Classe", points: "+50 XP" },
    { title: "Guia de Projetos Técnicos (ITEL/IPIL)", author: "Eng. M. Costa", type: "Técnico", points: "+60 XP" }
  ] : [
    { title: "Matemática para o Acesso - UAN", author: "Dr. K. Bernardo", type: "Engenharias", points: "+50 XP" },
    { title: "Química Orgânica Simplificada", author: "Prof. N. Mateus", type: "Medicina", points: "+40 XP" },
    { title: "Preparação de Português e Redação", author: "Dr. S. Kiala", type: "Comum", points: "+30 XP" }
  ];

  const videoRecommendations = isHighSchool ? [
    { title: "Equações do 2º Grau e Bhaskara Passo a Passo", channel: "Aprovei TV", duration: "18 min", points: "+50 XP" },
    { title: "Dinâmica e Leis de Newton para o Ensino Médio", channel: "Aprovei TV", duration: "25 min", points: "+70 XP" },
    { title: "Como estruturar um Relatório de Fim de Curso", channel: "Aprovei TV", duration: "15 min", points: "+40 XP" }
  ] : [
    { title: "Resolução Passo a Passo Exame de Matemática UAN 2024", channel: "Aprovei TV", duration: "45 min", points: "+100 XP" },
    { title: "Física Geral: Cinemática e Dinâmica para Exames", channel: "Aprovei TV", duration: "32 min", points: "+80 XP" },
    { title: "Como estruturar uma Redação Nota 10", channel: "Aprovei TV", duration: "18 min", points: "+50 XP" }
  ];

  const timelineUpdates = isHighSchool ? [
    { date: "Julho 2026", desc: "Provas Trimestrais do 2º Ciclo", status: "upcoming" },
    { date: "Agosto 2026", desc: "Defesas de Projetos Tecnológicos", status: "future" },
    { date: "Setembro 2026", desc: "Início das Matrículas Escolares", status: "future" }
  ] : [
    { date: "Julho 2026", desc: "Abertura das inscrições UAN", status: "upcoming" },
    { date: "Agosto 2026", desc: "Exames de acesso UAN", status: "future" },
    { date: "Setembro 2026", desc: "Edital ISUTIC 2ª chamada", status: "future" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-10 pb-20 relative font-sans">
      {/* Background decorations */}
      <div className="absolute top-[-5%] right-[5%] w-[400px] h-[400px] bg-primary/10 rounded-full filter blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute top-[30%] left-[-5%] w-[500px] h-[500px] bg-accent/10 rounded-full filter blur-[120px] -z-10 pointer-events-none"></div>

      {/* Gamified Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-10 rounded-[2rem] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative overflow-hidden group hover:border-orange/20 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange/5 to-transparent rounded-tr-full -z-10 group-hover:scale-110 transition-transform duration-700"></div>

        <div className="space-y-4 text-left flex-1">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange/10 border border-orange/20 text-orange text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            {isHighSchool ? "Módulo: Ensino Médio 🎒" : "Módulo: Acesso Superior 🎓"}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight font-title leading-tight">
            Olá, <span className="text-orange drop-shadow-[0_0_10px_rgba(255,107,0,0.3)]">{user.full_name || user.email?.split('@')[0]}</span>!
          </h2>
          <p className="text-white/60 text-lg font-medium">
            {isHighSchool 
              ? "Tens excelentes notas em perspetiva. Continua a focar-te nos teus manuais!"
              : "Estás cada vez mais perto da aprovação universitária. Vamos lá!"
            }
          </p>
        </div>

        <div className="flex gap-4 shrink-0 w-full lg:w-auto">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 lg:flex-none flex flex-col items-center justify-center shadow-inner">
            <Trophy className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] mb-2" />
            <span className="text-2xl font-black text-white">1,240</span>
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Total XP</span>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex-1 lg:flex-none flex flex-col items-center justify-center shadow-inner">
            <Target className="w-8 h-8 text-orange mb-2 animate-pulse" />
            <span className="text-2xl font-black text-white">12</span>
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Missões XP</span>
          </div>
        </div>
      </motion.div>

      {/* Progress Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Study Progress Card */}
        <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-8 rounded-[2rem] flex flex-col justify-between space-y-6 group hover:border-orange/20 transition-all duration-500 cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <div className="p-2.5 bg-orange/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-orange" />
              </div>
              <h3 className="font-black text-xl text-white font-title">Metas Semanais</h3>
            </div>
            <span className="bg-orange/10 text-orange text-sm px-3 py-1 rounded-lg font-bold border border-orange/20">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="space-y-3">
            <div className="w-full bg-white/5 border border-white/5 h-3 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${taskProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-orange h-full rounded-full relative"
              >
                <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
              </motion.div>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-white/60">Progresso</span>
              <span className="text-orange"><CountUp end={taskProgress} duration={2} />% Concluído</span>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Action Card */}
        <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-8 rounded-[2rem] flex flex-col justify-between space-y-6 group hover:border-orange/20 transition-all duration-500 cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <div className="p-2.5 bg-orange/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-orange animate-pulse" />
              </div>
              <h3 className="font-black text-xl text-white font-title">
                {isHighSchool ? "Manuais & Exercícios" : "Simulações de Exame"}
              </h3>
            </div>
            <span className="bg-orange/10 text-orange border border-orange/20 text-xs px-3 py-1 rounded-lg font-bold">
              +150 XP
            </span>
          </div>
          <p className="text-sm text-white/60 font-medium leading-relaxed text-left">
            {isHighSchool 
              ? "Pratica com fichas de exercícios da 10ª à 12ª classe. Avalia os teus conhecimentos e ganhe XP de bónus."
              : "Testa os teus conhecimentos num ambiente real de exame de acesso. Atinge 100% de acertos para progredir."
            }
          </p>
          <a href="/exams" className="text-sm text-orange font-bold hover:text-orange-accent flex items-center gap-2 transition-colors">
            <span>{isHighSchool ? "Ver Materiais" : "Iniciar Simulação"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* AI Tutor Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-[2rem] border border-primary/20 shadow-lg flex flex-col justify-between space-y-6 group relative overflow-hidden hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-0 blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between space-y-6 text-left">
            <div>
              <div className="p-2.5 bg-white/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-xl text-white font-title">Falar com o Tutor IA</h3>
            </div>
            <p className="text-sm text-white/90 font-medium leading-relaxed">
              Tira dúvidas instantâneas sobre qualquer conteúdo de {isHighSchool ? "Matemática ou Física do 2º ciclo" : "exames oficiais da UAN ou ISUTIC"}.
            </p>
            <a href="/ai-chat" className="text-sm text-white font-bold flex items-center gap-2 group/link">
              <span className="group-hover/link:underline transition-colors">Iniciar Chat</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid: Recommended materials & Updates */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-8 lg:grid-cols-12"
      >
        {/* Left Column: Recommendations */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Video Playlists */}
          <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-8 rounded-[2rem] space-y-8 relative overflow-hidden group hover:border-orange/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange to-transparent"></div>
            <h3 className="text-2xl font-black text-white flex items-center gap-3 font-title">
              <div className="p-2.5 bg-orange/10 rounded-xl border border-orange/20">
                <Play className="text-orange w-6 h-6 fill-current" />
              </div>
              <span>Aulas Recomendadas</span>
            </h3>
            <div className="space-y-4">
              {videoRecommendations.map((vid, idx) => (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  key={idx} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-orange/20 hover:shadow-md transition-all cursor-pointer group gap-4"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-3.5 bg-orange/10 text-orange border border-orange/20 rounded-xl group-hover:scale-105 group-hover:bg-orange group-hover:text-lilac-dark transition-all duration-300">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm group-hover:text-orange transition-colors">{vid.title}</h4>
                      <p className="text-xs text-white/50 font-semibold flex items-center gap-2">
                        <span>{vid.channel}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                        <span className="text-orange">{vid.duration}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    <span className="text-sm font-bold text-orange bg-orange/10 px-3 py-1 rounded-lg">{vid.points}</span>
                    <button className="text-white/40 group-hover:text-orange transition-colors p-2 bg-white/5 rounded-full shadow-sm border border-white/10 group-hover:border-orange/20 group-hover:shadow-md group-hover:-translate-x-1">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Books / Manuals */}
          <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-8 rounded-[2rem] space-y-8 relative overflow-hidden group hover:border-orange/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange to-transparent"></div>
            <h3 className="text-2xl font-black text-white flex items-center gap-3 font-title">
              <div className="p-2.5 bg-orange/10 rounded-xl border border-orange/20">
                <BookOpen className="text-orange w-6 h-6" />
              </div>
              <span>{isHighSchool ? "Manuais do Ensino Médio" : "Manuais de Preparação"}</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {bookRecommendations.map((book, idx) => (
                <motion.div 
                  whileHover={{ y: -5 }}
                  key={idx} 
                  className="p-6 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between space-y-4 hover:bg-white/10 hover:border-orange/20 transition-all cursor-pointer group text-left"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl shadow-sm border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange group-hover:text-lilac-dark group-hover:border-orange transition-all duration-300 text-orange">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-orange bg-orange/10 px-2 py-1 rounded-md">{book.points}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1 leading-tight group-hover:text-orange transition-colors">{book.title}</h4>
                    <p className="text-xs text-white/50 font-semibold mb-4">{book.author}</p>
                  </div>
                  <p className="text-[10px] bg-white/5 border border-white/10 text-white/60 px-2 py-1 rounded-md w-fit font-bold uppercase tracking-wider">{book.type}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Right Column: Timeline Updates */}
        <div className="lg:col-span-4 space-y-8">
          <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-8 rounded-[2rem] space-y-8 relative overflow-hidden group hover:border-orange/20 transition-all duration-500">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-orange to-transparent"></div>
            <h3 className="text-xl font-black text-white flex items-center gap-3 font-title">
              <div className="p-2.5 bg-orange/10 rounded-xl border border-orange/20">
                <Calendar className="text-orange w-6 h-6" />
              </div>
              <span>Agenda de Atividades</span>
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/15 before:to-transparent">
              {timelineUpdates.map((update, idx) => (
                <div key={idx} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group text-left">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-lilac-dark bg-white/10 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 mt-1 relative z-10 group-hover:scale-110 transition-transform">
                    <div className={`w-2 h-2 rounded-full ${update.status === 'upcoming' ? 'bg-orange shadow-[0_0_8px_rgba(255,107,0,0.8)] animate-pulse' : 'bg-white/20'}`}></div>
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-orange/20 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <h4 className={`font-bold text-xs ${update.status === 'upcoming' ? 'text-orange animate-pulse' : 'text-white/50'}`}>{update.date}</h4>
                    </div>
                    <p className="text-xs text-white font-semibold">{update.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// 🛡️ SUBCOMPONENTE: PAINEL DO ADMINISTRADOR
// ==========================================
function AdminDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTeachers, setActiveTeachers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'students' | 'teachers'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/teachers/admin/${userId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Professor aprovado com sucesso!");
      fetchAdminData();
    } catch (err) {
      alert("Erro ao aprovar professor.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm("Tem certeza que deseja rejeitar este candidato? Todos os dados dele serão excluídos por privacidade.")) return;
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('token');
      await api.post(`/teachers/admin/${userId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Candidatura rejeitada e dados apagados.");
      fetchAdminData();
    } catch (err) {
      alert("Erro ao rejeitar candidatura.");
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
    <div className="space-y-10 pb-20 text-left font-sans">
      <div className="flex justify-between items-center bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl">
        <div>
          <h2 className="text-3xl font-black text-white">Painel do Administrador 🛡️</h2>
          <p className="text-white/60">Controle total do ecossistema Aprovei.</p>
        </div>
        <span className="px-4 py-2 rounded-full bg-orange/10 border border-orange/25 text-orange font-bold text-sm">
          Sessão: {user.full_name}
        </span>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-5">
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
      <div className="flex border-b border-white/10 gap-6">
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
          <div className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl space-y-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <span>📋 Fila de Avaliação de Explicadores</span>
            </h3>

            {pending.length === 0 ? (
              <p className="text-white/55 font-medium py-8 text-center border border-dashed border-white/10 rounded-2xl">
                Nenhuma candidatura pendente no momento. Bom trabalho!
              </p>
            ) : (
              <div className="space-y-6">
                {pending.map((candidate) => (
                  <div key={candidate.id} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 flex flex-col xl:flex-row gap-6 justify-between items-start">
                    <div className="flex gap-4 items-start flex-1">
                      {candidate.photo_url ? (
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

                    <div className="flex xl:flex-col gap-3 shrink-0 w-full xl:w-auto">
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleApprove(candidate.id)}
                        className="flex-1 xl:flex-none btn-orange px-6 py-3 font-bold rounded-xl text-sm"
                      >
                        {actionLoading === candidate.id ? "A Processar..." : "Aprovar Candidato"}
                      </button>
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleReject(candidate.id)}
                        className="flex-1 xl:flex-none bg-rose-950/60 border border-rose-800/40 text-rose-300 hover:bg-rose-900 px-6 py-3 font-bold rounded-xl text-sm transition-all"
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
          <div className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl space-y-6">
            <h3 className="text-2xl font-black text-white">🎓 Estudantes Registados no Sistema</h3>
            {students.length === 0 ? (
              <p className="text-white/55 font-medium py-8 text-center border border-dashed border-white/10 rounded-2xl">
                Nenhum estudante registado na base de dados.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left border-collapse">
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
          <div className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl space-y-6">
            <h3 className="text-2xl font-black text-white">👨‍🏫 Explicadores Ativos no Sistema</h3>
            {activeTeachers.length === 0 ? (
              <p className="text-white/55 font-medium py-8 text-center border border-dashed border-white/10 rounded-2xl">
                Nenhum explicador ativo na base de dados.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {activeTeachers.map((teacher) => (
                  <div key={teacher.id} className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 flex gap-4 items-start">
                    {teacher.photo_url ? (
                      <img 
                        src={getStorageUrl(teacher.photo_url)} 
                        alt={teacher.full_name} 
                        className="w-16 h-16 rounded-xl object-cover border border-orange/30 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-orange/10 border border-orange/20 rounded-xl shrink-0 flex items-center justify-center text-orange font-bold">
                        Sem Foto
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

// ==========================================
// 📝 SUBCOMPONENTE: ENTREVISTA DO PROFESSOR
// ==========================================
function TeacherInterview({ user, onComplete }: { user: any; onComplete: (user: any) => void }) {
  const [formData, setFormData] = useState({
    specialty: '',
    bio: '',
    price_per_hour: '',
    location: '',
    whatsapp: '',
    subject_tags: '',
    experience: '',
    years_of_experience: '',
    what_intends: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Deve anexar o seu Currículo em formato PDF.');
      return;
    }
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('specialty', formData.specialty);
    data.append('bio', formData.bio);
    data.append('price_per_hour', formData.price_per_hour);
    data.append('location', formData.location);
    data.append('whatsapp', formData.whatsapp);
    data.append('subject_tags', formData.subject_tags);
    data.append('experience', formData.experience);
    data.append('years_of_experience', formData.years_of_experience);
    data.append('what_intends', formData.what_intends);
    data.append('resume', resumeFile);

    try {
      const res = await api.post('/teachers/apply', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Atualizar status do utilizador localmente
      const updatedUser = { ...user, status: res.data.status };
      onComplete(updatedUser);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao submeter a candidatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20 text-left font-sans">
      <div className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-bl-full pointer-events-none"></div>
        <h2 className="text-3xl font-black text-white flex items-center gap-2">
          <Award className="w-8 h-8 text-orange" />
          <span>Entrevista de Explicador Online</span>
        </h2>
        <p className="text-white/60 mt-2 font-medium">
          Preenche com detalhe e anexa o teu currículo. Esta será a tua <strong>única oportunidade</strong> de candidatura técnico-pedagógica.
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-rose-400 bg-rose-950/40 rounded-2xl border border-rose-800/40 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Cadeira / Especialidade Principal</label>
            <input
              type="text"
              required
              placeholder="Ex: Álgebra e Geometria Plana"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.specialty}
              onChange={e => setFormData({ ...formData, specialty: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Preço Pretendido / Hora (Kz)</label>
            <input
              type="number"
              required
              placeholder="Ex: 5000"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.price_per_hour}
              onChange={e => setFormData({ ...formData, price_per_hour: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Província e Município</label>
            <input
              type="text"
              required
              placeholder="Ex: Luanda, Talatona"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Link WhatsApp ou Telemóvel</label>
            <input
              type="text"
              required
              placeholder="Ex: https://wa.me/244923000000"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.whatsapp}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/60 ml-1 uppercase">Disciplinas Adicionais (Separadas por vírgula)</label>
          <input
            type="text"
            required
            placeholder="Ex: Matemática, Física, Análise Matemática"
            className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
            value={formData.subject_tags}
            onChange={e => setFormData({ ...formData, subject_tags: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/60 ml-1 uppercase">Apresentação / Biografia Rápida</label>
          <textarea
            required
            rows={3}
            placeholder="Escreve uma curta bio sobre ti para atrair estudantes..."
            className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/60 ml-1 uppercase">Experiência Profissional e de Docência (Completa)</label>
          <textarea
            required
            rows={3}
            placeholder="Onde lecionaste? Quais cargos ocupaste?"
            className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
            value={formData.experience}
            onChange={e => setFormData({ ...formData, experience: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Anos de Experiência Didática</label>
            <input
              type="number"
              required
              placeholder="Ex: 3"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.years_of_experience}
              onChange={e => setFormData({ ...formData, years_of_experience: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Currículo Vitae (Apenas PDF)</label>
            <input
              type="file"
              required
              accept="application/pdf"
              className="w-full px-4 py-3 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none text-sm focus:border-orange/50"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setResumeFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/60 ml-1 uppercase">O que pretendes alcançar como Explicador da Aprovei?</label>
          <textarea
            required
            rows={3}
            placeholder="Quais são as tuas metas pedagógicas e como podes motivar os teus futuros alunos?"
            className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
            value={formData.what_intends}
            onChange={e => setFormData({ ...formData, what_intends: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-orange py-4 font-black text-lg text-lilac-dark rounded-2xl hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Submetendo Candidatura..." : "Submeter Candidatura"}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// ⏳ SUBCOMPONENTE: FILA DE ESPERA DO PROFESSOR
// ==========================================
function TeacherPendingApproval({ user }: { user: any }) {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-16 text-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-lilac-dark/45 border border-white/10 p-12 rounded-[2.5rem] backdrop-blur-2xl space-y-6 flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-orange/10 border border-orange/20 rounded-full flex items-center justify-center text-orange text-3xl mb-4 animate-pulse">
          ⏳
        </div>
        <h2 className="text-3xl font-black text-white">Candidatura em Análise</h2>
        <p className="text-white/60 text-lg leading-relaxed">
          Obrigado, <span className="text-orange font-bold">{user.full_name}</span>. A tua entrevista online e currículo PDF foram submetidos com sucesso.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left w-full space-y-3 text-sm text-white/70">
          <p>✔️ <strong>Foto de Perfil:</strong> Carregada no registo</p>
          <p>✔️ <strong>Respostas da Entrevista:</strong> Recebidas</p>
          <p>✔️ <strong>Currículo Técnico PDF:</strong> Guardado no sistema</p>
          <p className="pt-3 text-orange font-bold text-xs uppercase tracking-wider">Próximo Passo:</p>
          <p className="text-xs text-white/50 leading-relaxed">
            A equipa administrativa está a avaliar a tua documentação. Se for validada, a tua conta será ativa e o teu perfil aparecerá aos alunos. Caso contrário, os teus dados serão excluídos permanentemente por questões de privacidade.
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = "/auth/login";
          }}
          className="bg-white/5 border border-white/10 text-white/75 hover:bg-white/10 px-6 py-3 font-bold rounded-xl text-sm transition-all"
        >
          Sair da Conta
        </button>
      </motion.div>
    </div>
  );
}

// ==========================================
// 👨‍🏫 SUBCOMPONENTE: PAINEL DO PROFESSOR (APROVADO)
// ==========================================
function TeacherDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-10 pb-20 text-left font-sans">
      {/* Banner */}
      <div className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-bl-full pointer-events-none"></div>
        <div className="flex gap-4 items-center">
          {user.photo_url && (
            <img 
              src={getStorageUrl(user.photo_url)} 
              alt={user.full_name}
              className="w-16 h-16 rounded-full border-2 border-orange/45 object-cover"
            />
          )}
          <div>
            <h2 className="text-3xl font-black text-white">Painel do Explicador 🎓</h2>
            <p className="text-white/60">Bem-vindo(a), Prof. {user.full_name}!</p>
          </div>
        </div>
      </div>

      {/* Grid de Metricas */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Minhas Turmas</h4>
          <p className="text-3xl font-black text-white mt-2">3 Ativas</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Preço por Hora</h4>
          <p className="text-3xl font-black text-orange mt-2">5,000 Kz</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Aulas Agendadas</h4>
          <p className="text-3xl font-black text-white mt-2">4 esta semana</p>
        </div>
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Avaliação Média</h4>
          <p className="text-3xl font-black text-amber-400 mt-2">5.0 ★</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Lembretes e Reuniões */}
        <div className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange" />
            <span>Próximas Aulas e Reuniões</span>
          </h3>
          <div className="space-y-3">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <p className="font-bold text-white text-sm">Aula Particular: Matemática (Álgebra)</p>
                <p className="text-xs text-white/50">Estudante: Hamilton Santos</p>
              </div>
              <span className="text-xs bg-orange/15 text-orange border border-orange/20 px-2 py-1 rounded">Hoje, 17:30</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <p className="font-bold text-white text-sm">Turma Virtual: Acesso UAN Física</p>
                <p className="text-xs text-white/50">30 Estudantes Inscritos</p>
              </div>
              <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded">Amanhã, 10:00</span>
            </div>
          </div>
        </div>

        {/* Fóruns e Dúvidas Recentes */}
        <div className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange" />
            <span>Dúvidas do Fórum para Explicar</span>
          </h3>
          <div className="space-y-3">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <p className="font-bold text-white text-sm hover:underline cursor-pointer">Como resolver x² - 5x + 6 = 0 pela fórmula geral?</p>
              <p className="text-xs text-white/55">Postado por: Ana Paula em Dúvidas Gerais</p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <p className="font-bold text-white text-sm hover:underline cursor-pointer">Diferença entre limite lateral e limite ordinário?</p>
              <p className="text-xs text-white/55">Postado por: Carlos Neto em Acesso Superior</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
