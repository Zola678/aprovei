"use client";
import React from 'react';
import { BookOpen, Play, FileText, ArrowRight, Zap, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { getStorageUrl } from '@/lib/api';

interface StudentDashboardProps {
  user: any;
  activeModule: any;
  taskProgress: number;
  bookRecommendations: any[];
  videoRecommendations: any[];
  timelineUpdates: any[];
}

export default function StudentDashboard({
  user,
  activeModule,
  taskProgress,
  bookRecommendations,
  videoRecommendations,
  timelineUpdates
}: StudentDashboardProps) {
  const isHighSchool = activeModule === "high_school";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-6 sm:space-y-10 px-4 sm:px-0 pt-6 sm:pt-0 font-sans text-left">
      {/* Top Banner: Welcome & Streak */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-lilac-dark/45 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-2xl backdrop-blur-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-bl-full pointer-events-none"></div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight font-title">
            Bons estudos, <span className="text-orange-glow">{user.full_name || "Estudante"}</span>! 
          </h2>
          <p className="text-white/60 font-medium text-sm md:text-base">
            {isHighSchool 
              ? "Pronto para dominar as matérias do Ensino Médio hoje?" 
              : "Foco total na admissão! A tua vaga na universidade está cada vez mais perto."
            }
          </p>
        </div>
        
        {/* Status Indicators */}
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-3">
            <span className="text-2xl animate-pulse">🔥</span>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Estudante VIP</p>
              <p className="text-sm font-black text-white">
                {user.is_premium ? "VIP Premium ⭐" : "Acesso Gratuito"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Weekly Goals Card */}
        <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] flex flex-col justify-between space-y-6 group hover:border-orange/20 transition-all duration-500 cursor-pointer">
          <div>
            <div className="p-2.5 bg-orange/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-6 h-6 text-orange" />
            </div>
            <h3 className="font-black text-lg sm:text-xl text-white font-title">Metas Semanais</h3>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden relative border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${taskProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-orange to-amber-500 rounded-full shadow-[0_0_8px_rgba(255,107,0,0.6)]"
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
        <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] flex flex-col justify-between space-y-6 group hover:border-orange/20 transition-all duration-500 cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <div className="p-2.5 bg-orange/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-orange animate-pulse" />
              </div>
              <h3 className="font-black text-lg sm:text-xl text-white font-title">
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
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-primary-dark p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-primary/20 shadow-lg flex flex-col justify-between space-y-6 group relative overflow-hidden hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-0 blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between space-y-6 text-left">
            <div>
              <div className="p-2.5 bg-white/20 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-lg sm:text-xl text-white font-title">Falar com o Tutor IA</h3>
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
          <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] space-y-6 sm:space-y-8 relative overflow-hidden group hover:border-orange/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange to-transparent"></div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3 font-title">
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-orange/20 hover:shadow-md transition-all cursor-pointer group gap-4"
                  onClick={() => vid.file_url && window.open(vid.file_url.startsWith('storage') ? getStorageUrl(vid.file_url) : vid.file_url, '_blank')}
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
          <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] space-y-6 sm:space-y-8 relative overflow-hidden group hover:border-orange/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange to-transparent"></div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3 font-title">
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
                  className="p-4 sm:p-6 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl flex flex-col justify-between space-y-4 hover:bg-white/10 hover:border-orange/20 transition-all cursor-pointer group text-left"
                  onClick={() => book.file_url && window.open(book.file_url.startsWith('storage') ? getStorageUrl(book.file_url) : book.file_url, '_blank')}
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
          <motion.div variants={itemVariants} className="bg-lilac-dark/45 border border-white/10 shadow-2xl backdrop-blur-2xl p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] space-y-6 sm:space-y-8 relative overflow-hidden group hover:border-orange/20 transition-all duration-500">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-orange to-transparent"></div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-3 font-title">
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
