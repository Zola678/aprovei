"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Building2, MapPin, ArrowRight, Search, Target, Sparkles } from "lucide-react";

const institutes = [
  {
    name: "ITEL",
    fullname: "Instituto de Telecomunicações",
    type: "Técnico Profissional",
    location: "Luanda, Rangel",
    description: "Referência nacional na formação de técnicos de Informática, Telecomunicações e Electrónica.",
    color: "from-orange to-amber-500",
    glowColor: "rgba(255,107,0,0.15)"
  },
  {
    name: "IMEL",
    fullname: "Instituto Médio de Economia de Luanda",
    type: "Técnico Profissional",
    location: "Luanda, Maianga",
    description: "Instituição de topo para cursos de Contabilidade, Finanças e Gestão Empresarial.",
    color: "from-lilac-light to-lilac",
    glowColor: "rgba(123,79,166,0.15)"
  },
  {
    name: "INP",
    fullname: "Instituto Nacional de Petróleos",
    type: "Técnico Profissional",
    location: "Kwanza Sul, Sumbe",
    description: "Centro de excelência para a formação de quadros no sector dos petróleos em Angola.",
    color: "from-orange to-red-500",
    glowColor: "rgba(255,107,0,0.15)"
  },
  {
    name: "Mutu-ya-Kevela",
    fullname: "Liceu Mutu-ya-Kevela",
    type: "Formação Geral",
    location: "Luanda, Ingombota",
    description: "Um dos liceus mais tradicionais e prestigiados de Angola, oferecendo ensino de excelência.",
    color: "from-lilac-light to-orange",
    glowColor: "rgba(123,79,166,0.15)"
  },
  {
    name: "IPIL",
    fullname: "Instituto Politécnico Industrial",
    type: "Técnico Profissional",
    location: "Luanda, Maculusso",
    description: "Foco na indústria: Mecânica, Electricidade, Construção Civil e Química.",
    color: "from-amber-500 to-orange",
    glowColor: "rgba(255,107,0,0.15)"
  },
  {
    name: "PUNIV",
    fullname: "Pré-Universitário",
    type: "Formação Geral",
    location: "Várias Províncias",
    description: "A rampa de lançamento ideal para o ensino superior nas ciências exatas e humanas.",
    color: "from-lilac to-lilac-light",
    glowColor: "rgba(91,46,130,0.15)"
  }
];

export default function EnsinoMedioPage() {
  return (
    <div className="min-h-screen bg-transparent pt-12 pb-20 px-6 md:px-12 lg:px-20 xl:px-32 font-sans overflow-hidden relative z-10">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lilac-light/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-orange/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      {/* Split Hero Section */}
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 gap-16 items-center mb-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lilac-base/30 text-white text-sm font-bold border border-lilac-light/20 shadow-[0_0_15px_rgba(123,79,166,0.2)] backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-orange" />
            <span>Foco no 2º Ciclo</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] font-title">
            O teu caminho no <br/>
            <span className="text-orange-glow">Ensino Médio.</span>
          </h1>
          <p className="text-xl text-white/70 leading-relaxed font-medium">
            Desenvolvemos uma estrutura focada nos currículos dos principais institutos de Angola. Acede a materiais específicos e interage com a nossa IA.
          </p>
          
          <div className="relative w-full max-w-lg mt-8">
            <input 
              type="text" 
              placeholder="Pesquisa por classe, disciplina ou instituto..." 
              className="w-full pl-14 pr-6 py-4.5 rounded-2xl border border-lilac-light/30 bg-lilac-dark/40 text-white placeholder:text-white/40 focus:outline-none focus:border-orange/50 focus:ring-2 focus:ring-orange/20 transition-all font-medium"
            />
            <Search className="w-5.5 h-5.5 text-orange absolute left-5 top-1/2 -translate-y-1/2" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative hidden lg:block"
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-lilac-light to-orange rounded-[3rem] transform rotate-3 scale-105 opacity-20 blur-xl"></div>
           <div className="card-lilac-glass p-10 border-lilac-light/30 shadow-2xl relative z-10 transform -rotate-2">
             <div className="grid grid-cols-2 gap-6">
                {[
                  { class: "10ª Classe", desc: "Iniciação Técnica" },
                  { class: "11ª Classe", desc: "Desenvolvimento" },
                  { class: "12ª Classe", desc: "Projeto Final" },
                  { class: "PUNIV", desc: "Acesso Rápido" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-lilac-dark/40 p-6 rounded-2xl border border-lilac-light/20 hover:border-orange/30 hover:shadow-[0_0_15px_rgba(255,107,0,0.2)] transition-all cursor-pointer">
                     <h4 className="text-xl font-black text-white font-title">{item.class}</h4>
                     <p className="text-sm text-white/60 mt-2 font-medium">{item.desc}</p>
                  </div>
                ))}
             </div>
           </div>
        </motion.div>
      </div>

      {/* Institutes Grid */}
      <div className="max-w-[1600px] mx-auto mb-32 relative z-10">
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 font-title">
            <Building2 className="w-10 h-10 text-orange animate-pulse" />
            Institutos de Excelência
          </h2>
          <p className="text-lg text-white/70 mt-4 font-medium">Materiais e conteúdos direcionados às realidades das maiores instituições.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {institutes.map((inst, index) => (
            <motion.div 
              key={inst.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 hover:border-orange/40 shadow-xl flex flex-col h-full relative overflow-hidden group rounded-[2.5rem]"
            >
              {/* Colored light accent in the corner */}
              <div 
                className="absolute top-0 right-0 w-40 h-40 rounded-bl-[100px] -mr-10 -mt-10 opacity-10 group-hover:opacity-25 transition-all duration-500 z-0"
                style={{ 
                  background: `radial-gradient(circle, ${inst.glowColor || 'rgba(255,107,0,0.4)'} 0%, transparent 70%)`,
                  backgroundColor: inst.glowColor
                }}
              ></div>
              
              <div className="relative z-10 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-3xl font-black text-white font-title group-hover:text-orange transition-colors">{inst.name}</h3>
                  <span className={`px-4 py-1.5 bg-gradient-to-r ${inst.color} text-lilac-dark text-xs font-bold rounded-full shadow-md`}>
                    {inst.type}
                  </span>
                </div>
                <p className="text-sm font-bold text-orange mb-3">{inst.fullname}</p>
                <p className="text-white/70 mb-8 leading-relaxed font-medium text-sm">{inst.description}</p>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-white/55 font-bold">
                  <MapPin className="w-4 h-4 text-orange" />
                  {inst.location}
                </div>
                <button className={`w-11 h-11 rounded-full flex items-center justify-center bg-orange text-lilac-dark shadow-md hover:shadow-[0_0_15px_rgba(255,107,0,0.5)] group-hover:scale-110 transition-all duration-300`}>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
