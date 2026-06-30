"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useModule } from '@/context/ModuleContext';
import { useRouter } from 'next/navigation';

// Importando componentes das Dashboards refatoradas
import StudentDashboard from './_components/StudentDashboard';
import AdminDashboard from './_components/AdminDashboard';
import TeacherDashboard from './_components/TeacherDashboard';
import TeacherInterview from './_components/TeacherInterview';
import TeacherPendingApproval from './_components/TeacherPending';

export default function DashboardPage() {
  const router = useRouter();
  const { activeModule } = useModule();
  
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/auth/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'student') {
        fetchStudentData(token, activeModule);
      } else {
        setLoading(false);
      }
    }
  }, [router, activeModule]);

  const fetchStudentData = async (authToken: string, module: any) => {
    try {
      const [tasksRes, materialsRes, examsRes] = await Promise.all([
        api.get('/study/tasks', { headers: { 'Authorization': `Bearer ${authToken}` } }).catch(() => ({ data: [] })),
        api.get('/materials', { headers: { 'Authorization': `Bearer ${authToken}` } }).catch(() => ({ data: [] })),
        api.get('/exams', { headers: { 'Authorization': `Bearer ${authToken}` } }).catch(() => ({ data: [] }))
      ]);
      
      setTasks(tasksRes.data);
      setMaterials(materialsRes.data);
      setExams(examsRes.data);
    } catch (err) {
      console.log("Erro ao buscar dados do estudante");
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

  // --- ROTEAMENTO CONDICIONAL DE DASHBOARDS POR ROLE E STATUS ---
  
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

  // --- COMPILADOR DE DADOS DO ESTUDANTE ---
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isHighSchool = activeModule === "high_school";

  const backendPDFs = materials.filter(m => !(m.file_url.startsWith('http') || m.file_url.includes('youtube.com') || m.file_url.includes('youtu.be')));
  const backendVideos = materials.filter(m => m.file_url.startsWith('http') || m.file_url.includes('youtube.com') || m.file_url.includes('youtu.be'));

  const bookRecommendations = isHighSchool 
    ? (backendPDFs.length > 0 
        ? backendPDFs.map(m => ({ title: m.title, author: m.description || "Tutor Aprovei", type: `${m.grade}ª Classe`, points: "+40 XP", file_url: m.file_url }))
        : [
            { title: "Manual de Matemática - 10ª Classe", author: "Ministério da Educação", type: "10ª Classe", points: "+40 XP", file_url: "" },
            { title: "Apontamentos de Física - 11ª Classe", author: "Prof. Alberto Neto", type: "11ª Classe", points: "+50 XP", file_url: "" }
          ]
      )
    : (exams.length > 0
        ? exams.map(e => ({ title: `${e.subject} - ${e.university}`, author: e.description || "Exame de Acesso", type: `${e.year}`, points: "+50 XP", file_url: e.pdf_url }))
        : [
            { title: "Matemática para o Acesso - UAN", author: "Dr. K. Bernardo", type: "Engenharias", points: "+50 XP", file_url: "" },
            { title: "Preparação de Português e Redação", author: "Dr. S. Kiala", type: "Comum", points: "+30 XP", file_url: "" }
          ]
      );

  const videoRecommendations = isHighSchool
    ? (backendVideos.length > 0
        ? backendVideos.map(m => ({ title: m.title, channel: m.description || "Aprovei TV", duration: "Vídeo Aula", points: "+50 XP", file_url: m.file_url }))
        : [
            { title: "Equações do 2º Grau e Bhaskara Passo a Passo", channel: "Aprovei TV", duration: "18 min", points: "+50 XP", file_url: "" }
          ]
      )
    : [
        { title: "Resolução Passo a Passo Exame de Matemática UAN 2024", channel: "Aprovei TV", duration: "45 min", points: "+100 XP", file_url: "" },
        { title: "Física Geral: Cinemática e Dinâmica para Exames", channel: "Aprovei TV", duration: "32 min", points: "+80 XP", file_url: "" }
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

  return (
    <StudentDashboard 
      user={user}
      activeModule={activeModule}
      taskProgress={taskProgress}
      bookRecommendations={bookRecommendations}
      videoRecommendations={videoRecommendations}
      timelineUpdates={timelineUpdates}
    />
  );
}
