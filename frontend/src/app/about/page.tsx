import React from "react";
import { Users, GraduationCap, Globe, Shield, Target, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-20 py-16 px-4 md:px-8 relative z-10 font-sans">
      {/* Background decorations */}
      <div className="absolute top-[10%] left-[-10%] w-[450px] h-[450px] bg-lilac-light/10 rounded-full filter blur-[130px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-orange/5 rounded-full filter blur-[130px] -z-10 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
          <Award className="w-4 h-4 text-orange" />
          <span>O Nosso Manifesto</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white font-title tracking-tight">
          Quem <span className="text-orange-glow">Somos</span>
        </h1>
        <p className="text-white/70 text-lg leading-relaxed font-medium">
          Inspirados no modelo do <span className="font-bold text-orange">Programa de Extensão Académica (PEA)</span>, a nossa missão é ser o ecossistema que liga o potencial da juventude angolana às oportunidades no ensino superior e no mercado de trabalho.
        </p>
      </section>

      {/* Vision & Pillars Grid */}
      <section className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6 text-left">
          <h2 className="text-3xl md:text-4xl font-black text-white font-title">A Nossa Visão</h2>
          <p className="text-white/70 leading-relaxed font-medium">
            Acreditamos que a educação deve ir além da sala de aula. Queremos reduzir a lacuna entre a preparação teórica e as reais exigências académicas e de mercado. 
          </p>
          <p className="text-white/70 leading-relaxed font-medium">
            Através de bootcamps, mentorias, turmas de preparação intensiva e plataformas digitais interativas, criamos um ambiente onde os estudantes não só aprendem, mas transformam-se em talentos de excelência.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 hover:bg-white/10 hover:border-orange/20 transition-all duration-300 shadow-lg group cursor-pointer">
            <GraduationCap className="w-8 h-8 text-orange group-hover:scale-105 transition-transform" />
            <h3 className="font-bold text-white font-title group-hover:text-orange transition-colors">Formação</h3>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 hover:bg-white/10 hover:border-orange/20 transition-all duration-300 shadow-lg group cursor-pointer">
            <Users className="w-8 h-8 text-orange group-hover:scale-105 transition-transform" />
            <h3 className="font-bold text-white font-title group-hover:text-orange transition-colors">Comunidade</h3>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 hover:bg-white/10 hover:border-orange/20 transition-all duration-300 shadow-lg group cursor-pointer">
            <Target className="w-8 h-8 text-orange group-hover:scale-105 transition-transform" />
            <h3 className="font-bold text-white font-title group-hover:text-orange transition-colors">Objetivos</h3>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 hover:bg-white/10 hover:border-orange/20 transition-all duration-300 shadow-lg group cursor-pointer">
            <Globe className="w-8 h-8 text-orange group-hover:scale-105 transition-transform" />
            <h3 className="font-bold text-white font-title group-hover:text-orange transition-colors">Ecossistema</h3>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="card-lilac-glass bg-lilac-dark/45 border border-white/10 rounded-[2.5rem] p-10 md:p-16 text-center space-y-10 hover:border-orange/20 shadow-2xl backdrop-blur-2xl transition-all duration-500">
        <div className="p-4 bg-orange/10 border border-orange/20 text-orange rounded-2xl w-fit mx-auto shadow-sm">
          <Shield className="w-10 h-10 text-orange" />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white font-title tracking-tight">Os Nossos Valores</h2>
        
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-xl font-bold text-orange font-title">Inovação</h4>
            <p className="text-white/70 text-sm leading-relaxed font-medium">Procuramos sempre as ferramentas mais modernas para facilitar a aprendizagem.</p>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-xl font-bold text-orange font-title">Impacto Social</h4>
            <p className="text-white/70 text-sm leading-relaxed font-medium">O nosso sucesso mede-se pelo número de jovens que conseguimos ajudar a ingressar na universidade e crescer profissionalmente.</p>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-xl font-bold text-orange font-title">Excelência</h4>
            <p className="text-white/70 text-sm leading-relaxed font-medium">Rigor e qualidade nas resoluções, aulas e acompanhamento dos nossos alunos.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
