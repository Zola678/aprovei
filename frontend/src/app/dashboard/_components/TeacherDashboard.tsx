"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Award, BookOpen, Star, ArrowRight, Video, Plus, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api, { getStorageUrl } from '@/lib/api';
import Link from 'next/link';

export default function TeacherDashboard({ user }: { user: any }) {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Buscar turmas cadastradas na plataforma
      const classRes = await api.get('/classrooms');
      const myClasses = classRes.data.filter((c: any) => c.teacher_id === user.id);
      setClassrooms(myClasses);

      // Buscar matrículas pendentes
      const enrollRes = await api.get('/classrooms/teacher/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingEnrollments(enrollRes.data.filter((e: any) => e.status === 'pending_approval'));
    } catch (err) {
      console.error("Erro ao carregar dados do explicador", err);
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = (path: string) => {
    return getStorageUrl(path);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-orange/20 border-t-orange rounded-full animate-spin"></div>
        <p className="text-white/60 font-semibold animate-pulse text-sm">A carregar Painel do Explicador...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10 px-4 sm:px-0 pt-6 sm:pt-0 text-left font-sans">
      {/* Banner */}
      <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-bl-full pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {user.photo_url ? (
            <img 
              src={getFullUrl(user.photo_url)} 
              alt={user.full_name}
              className="w-16 h-16 rounded-full border-2 border-orange/45 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-orange/10 border-2 border-orange/20 flex items-center justify-center text-orange font-bold font-title text-xl">
              {user.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'EX'}
            </div>
          )}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Painel do Explicador 🎓</h2>
            <p className="text-white/60">Bem-vindo(a), Prof. {user.full_name}!</p>
          </div>
        </div>
      </div>

      {/* Grid de Metricas */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
        <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Minhas Turmas</h4>
          <p className="text-xl sm:text-3xl font-black text-white mt-2">{classrooms.length} Ativas</p>
        </div>
        <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Preço Definido</h4>
          <p className="text-xl sm:text-3xl font-black text-orange mt-2">
            {classrooms.length > 0 ? Number(classrooms[0].price).toLocaleString() : '---'} Kz
          </p>
        </div>
        <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Inscrições Pendentes</h4>
          <p className="text-xl sm:text-3xl font-black text-amber-400 mt-2">{pendingEnrollments.length} alunos</p>
        </div>
        <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
          <h4 className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Avaliação Média</h4>
          <p className="text-xl sm:text-3xl font-black text-white mt-2">5.0 ★</p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Moderação Rápida de Matrículas */}
        <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange" />
              <span>Solicitações de Matrículas Recentes</span>
            </h3>
            {pendingEnrollments.length === 0 ? (
              <p className="text-white/50 text-sm font-medium py-6 italic text-center">Nenhuma matrícula pendente no momento.</p>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {pendingEnrollments.map((enr) => (
                  <div key={enr.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-3 justify-between items-center text-sm min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{enr.student?.full_name}</p>
                      <p className="text-xs text-white/50 truncate">Turma: {enr.classroom?.name}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs bg-orange/15 text-orange px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0">Aguardando</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link href="/preparatorio" className="text-sm text-orange font-bold hover:underline flex items-center gap-2 justify-end pt-4 border-t border-white/5 mt-4">
            <span>Ir para Moderação de Turmas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Minhas Turmas Criadas */}
        <div className="bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-orange" />
              <span>Minhas Turmas Digitais</span>
            </h3>
            {classrooms.length === 0 ? (
              <p className="text-white/55 text-sm font-medium py-6 italic text-center">Nenhuma turma criada ainda.</p>
            ) : (
              <div className="space-y-3">
                {classrooms.map((c) => (
                  <div key={c.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-3 justify-between items-center text-sm min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{c.name}</p>
                      <p className="text-xs text-white/50 truncate">Matéria: {c.subject}</p>
                    </div>
                    <span className="text-[10px] sm:text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded font-bold border border-green-500/25 shrink-0">Ativa</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link href="/preparatorio" className="text-sm text-orange font-bold hover:underline flex items-center gap-2 justify-end pt-4 border-t border-white/5 mt-4">
            <span>Gerir / Criar Novas Turmas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
