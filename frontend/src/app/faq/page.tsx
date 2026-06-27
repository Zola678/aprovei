import React from "react";
import { HelpCircle, Mail, ArrowRight, Sparkles } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      question: "Como funciona a plataforma APROVEI?",
      answer: "A APROVEI oferece acesso a exames de admissão resolvidos, turmas preparatórias e uma comunidade ativa para ajudar-te a entrar na universidade."
    },
    {
      question: "O que é o Programa de Extensão Académica (PEA)?",
      answer: "O PEA é uma iniciativa que liga a academia ao mercado de trabalho, promovendo bootcamps, hackathons e integração profissional, na qual a nossa metodologia se inspira."
    },
    {
      question: "Posso encontrar tutores para aulas particulares?",
      answer: "Sim! Na nossa secção de Professores, podes encontrar tutores experientes em diversas disciplinas, prontos para te ajudar em casa ou online."
    },
    {
      question: "Como acedo aos exames resolvidos?",
      answer: "Basta criar uma conta gratuita na plataforma. Terás acesso a várias provas das principais universidades de Angola, com resoluções passo a passo."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-16 px-4 md:px-8 relative z-10 font-sans">
      {/* Background decoration highlights */}
      <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-lilac-light/10 rounded-full filter blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-orange/5 rounded-full filter blur-[120px] -z-10 pointer-events-none"></div>

      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
          <HelpCircle className="w-4 h-4 text-orange animate-pulse" />
          <span>Suporte ao Estudante</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white font-title tracking-tight">
          Perguntas <span className="text-orange-glow">Frequentes</span>
        </h1>
        <p className="text-white/60 text-lg font-medium leading-relaxed">
          Encontra rapidamente respostas às dúvidas mais comuns sobre a nossa plataforma e começa já a estudar.
        </p>
      </div>

      {/* Two-Column Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: CTA/Help Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-2xl p-8 text-left relative overflow-hidden group hover:border-orange/20 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="p-3.5 bg-orange/10 text-orange border border-orange/20 rounded-xl w-fit mb-6 group-hover:scale-105 transition-transform duration-300">
              <Mail className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2 font-title">Ainda tens dúvidas?</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium">
              Não encontraste o que procuravas? Estamos aqui para te guiar em cada detalhe. Entra em contacto com a nossa equipa.
            </p>
            
            <a 
              href="mailto:geral-pea@outlook.com" 
              className="inline-flex items-center justify-center gap-2 w-full bg-orange text-lilac-dark font-black px-6 py-4 rounded-xl hover:bg-orange/85 transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(255,107,0,0.35)] text-sm"
            >
              <span>Falar com o Suporte</span>
              <ArrowRight className="w-4 h-4 text-lilac-dark group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Right Column: FAQ Accordion List */}
        <div className="lg:col-span-8 space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange/20 p-6 rounded-2xl transition-all duration-300 shadow-lg text-left group cursor-pointer"
            >
              <h3 className="text-lg font-black text-white font-title mb-2 group-hover:text-orange transition-colors duration-300">
                {faq.question}
              </h3>
              <p className="text-white/70 leading-relaxed text-sm font-medium">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
