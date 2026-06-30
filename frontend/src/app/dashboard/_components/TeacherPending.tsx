"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function TeacherPending({ user }: { user: any }) {
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
