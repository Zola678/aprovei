"use client";
import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  GraduationCap, 
  ArrowUpRight, 
  ChevronRight, 
  Play, 
  Sparkles, 
  Bot, 
  BrainCircuit, 
  Users, 
  Trophy, 
  Handshake, 
  Calendar, 
  MessageSquare, 
  Target,
  ArrowRight,
  Globe,
  Calculator,
  Percent,
  Compass,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import Link from "next/link";
import confetti from "canvas-confetti";
import Constellation from "../components/Constellation";
import NeuralLines from "../components/NeuralLines";
import ScanLine from "../components/ScanLine";

const heroBackgrounds = [
  "/homepage_bg.jpg",
  "/WhatsApp%20Image%202026-06-22%20at%2015.36.43%20(1).jpeg",
  "/WhatsApp%20Image%202026-06-22%20at%2015.36.43%20(12).jpeg",
  "/WhatsApp%20Image%202026-06-22%20at%2015.36.43%20(13).jpeg",
  "/WhatsApp%20Image%202026-06-22%20at%2015.36.43.jpeg"
];

// Dados reais para o Simulador de Admissibilidade
const universityData: Record<string, { name: string; courses: Record<string, { minScore: number; tip: string }> }> = {
  UAN: {
    name: "Universidade Agostinho Neto",
    courses: {
      "Medicina": { minScore: 16, tip: "Foco total em Biologia e Química. O exame exige precisão cirúrgica e a concorrência é altíssima." },
      "Engenharia Informática": { minScore: 14, tip: "Estuda Geometria Analítica e Trigonometria. A prova de Matemática da UAN costuma ser eliminatória." },
      "Direito": { minScore: 13, tip: "A prova de Língua Portuguesa e História exige excelente capacidade de redação e interpretação textual." },
      "Economia": { minScore: 12, tip: "Matemática Geral e raciocínio lógico são as chaves para garantir a tua vaga." }
    }
  },
  ISUTIC: {
    name: "Instituto Superior de TIC",
    courses: {
      "Engenharia de Telecomunicações": { minScore: 13, tip: "Dá atenção redobrada à Física Elétrica e Ondas Mecânicas no exame de acesso." },
      "Engenharia Informática": { minScore: 14, tip: "Programação e lógica. Estuda polinómios e matrizes para a prova de Matemática." }
    }
  },
  UMN: {
    name: "Universidade Mandume Ya Ndemufayo",
    courses: {
      "Medicina": { minScore: 15, tip: "Biologia celular e anatomia humana básica são recorrentes no exame da UMN." },
      "Agronomia": { minScore: 11, tip: "Conceitos básicos de Química Orgânica e Geografia dão-te vantagem competitiva." }
    }
  }
};

export default function Home() {
  const [showScanLine, setShowScanLine] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  // Estados do Simulador de Admissibilidade
  const [selectedUni, setSelectedUni] = useState("UAN");
  const [selectedCourse, setSelectedCourse] = useState("Engenharia Informática");
  const [targetScore, setTargetScore] = useState(12);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{ probability: number; tip: string } | null>(null);

  // Estados do Hub de Preparação (Ensino Médio vs Acesso Superior)
  const [prepTab, setPrepTab] = useState<"medio" | "superior">("superior");

  // Estados do Mini-Simulado Interativo (Inovação Exclusiva APROVEI)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizStatus, setQuizStatus] = useState<"idle" | "correct" | "incorrect">("idle");

  useEffect(() => {
    // Rotação de background robusta
    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroBackgrounds.length);
    }, 6000);

    // Linha de scan ocasional
    const triggerScan = () => {
      setShowScanLine(true);
      setTimeout(() => setShowScanLine(false), 2200);
      const nextTime = Math.random() * 8000 + 8000;
      setTimeout(triggerScan, nextTime);
    };
    const timer = setTimeout(triggerScan, 2000);

    return () => {
      clearInterval(bgInterval);
      clearTimeout(timer);
    };
  }, []);

  // Atualizar cursos quando a universidade muda
  useEffect(() => {
    const courses = Object.keys(universityData[selectedUni]?.courses || {});
    if (courses.length > 0 && !courses.includes(selectedCourse)) {
      setSelectedCourse(courses[0]);
    }
  }, [selectedUni]);

  // Função para rodar a simulação
  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      const courseInfo = universityData[selectedUni]?.courses[selectedCourse];
      if (courseInfo) {
        const diff = targetScore - courseInfo.minScore;
        let probability = 50 + diff * 15;
        if (probability > 98) probability = 98;
        if (probability < 5) probability = 5;

        setSimulationResult({
          probability: Math.round(probability),
          tip: courseInfo.tip
        });
      }
      setIsSimulating(false);
    }, 1200);
  };

  // Função para verificar resposta do Mini-Simulado
  const handleAnswerClick = (index: number) => {
    if (quizStatus !== "idle") return; // impede cliques duplos
    setSelectedAnswer(index);
    if (index === 2) { // 'e' é a resposta correta (índice 2)
      setQuizStatus("correct");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ["#FF6B00", "#7B4FA6", "#FFFFFF"]
      });
    } else {
      setQuizStatus("incorrect");
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswer(null);
    setQuizStatus("idle");
  };

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden bg-background">
      {/* Elementos Interativos de Background */}
      <Constellation />
      <NeuralLines />
      {showScanLine && <ScanLine />}

      {/* --- 1. HERO SECTION (Slideshow instantâneo com Grid e Simulador) --- */}
      <section id="top" className="relative min-h-[100svh] flex items-center overflow-hidden">
        {/* Slideshow de Imagens Reais - Sem atraso ou montagem em branco */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {heroBackgrounds.map((bg, idx) => (
            <img 
              key={bg}
              src={bg} 
              alt="Estudantes em Angola" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${idx === bgIndex ? "opacity-15 md:opacity-35" : "opacity-0"}`} 
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-lilac-dark via-lilac-dark/95 to-transparent z-10" />
        </div>

        {/* Grid de Conteúdo - Alinhamento ideal de margens */}
        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 md:px-8 py-32 md:py-40 min-h-[100svh] flex items-center">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
            
            {/* Bloco Esquerdo: Textos e Chamada APROVEI */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Tag / Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md"
              >
                <span className="size-2 rounded-full bg-orange-accent animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/80 text-beam-effect">
                  Aprovação Garantida no Ensino Superior
                </span>
              </motion.div>

              {/* Título Principal */}
              <h1 className="font-display text-[clamp(2.3rem,5.5vw,4.8rem)] leading-[1.05] font-black tracking-tighter text-white">
                <span className="block">Domina os exames e</span>
                <span className="block">
                  conquista a tua <span className="text-orange-glow">Vaga.</span>
                </span>
              </h1>

              {/* Descrição Curta */}
              <p className="max-w-xl text-base md:text-lg text-white/85 leading-relaxed font-medium">
                A plataforma de estudos mais inteligente de Angola. Prepara-te para os exames da UAN, ISUTIC, UMN ou consolida os teus conhecimentos do Ensino Médio Técnico com resoluções oficiais e tutor IA.
              </p>

              {/* CTAs Principais */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link 
                  href="/exams" 
                  className="btn-orange group inline-flex items-center gap-2.5 px-7 py-4 text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,107,0,0.55)] hover:shadow-[0_0_30px_rgba(255,107,0,0.8)] rounded-full"
                >
                  <span>Ver Provas de Admissão</span>
                  <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Link>
                <a 
                  href="#prep-hub" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white underline-offset-8 hover:underline transition-all"
                >
                  Módulos de Estudo
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Bloco Direito: Simulador de Admissibilidade */}
            <div className="lg:col-span-5 w-full">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="card-lilac-glass p-6 md:p-8 border border-white/10 bg-lilac-dark/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(46,18,69,0.7)] hover:transform-none"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-accent/10 border border-orange-accent/20 rounded-xl">
                    <Calculator className="w-5 h-5 text-orange-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-title text-white">Simulador de Admissibilidade</h3>
                    <p className="text-xs text-white/50">Avalia as tuas chances de admissão</p>
                  </div>
                </div>

                <form onSubmit={handleSimulate} className="space-y-4">
                  {/* Select Universidade */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Universidade</label>
                    <select 
                      value={selectedUni} 
                      onChange={(e) => setSelectedUni(e.target.value)}
                      className="w-full bg-lilac-base/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-accent transition-colors"
                    >
                      {Object.keys(universityData).map((key) => (
                        <option key={key} value={key} className="bg-lilac-dark text-white">
                          {universityData[key].name} ({key})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Curso */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Curso Desejado</label>
                    <select 
                      value={selectedCourse} 
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="w-full bg-lilac-base/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-accent transition-colors"
                    >
                      {Object.keys(universityData[selectedUni]?.courses || {}).map((course) => (
                        <option key={course} value={course} className="bg-lilac-dark text-white">
                          {course}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nota Esperada */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Nota Média Esperada (0-20)</label>
                      <span className="text-sm font-black text-orange-accent">{targetScore} Valores</span>
                    </div>
                    <input 
                      type="range" 
                      min="8" 
                      max="20" 
                      step="1"
                      value={targetScore} 
                      onChange={(e) => setTargetScore(parseInt(e.target.value))}
                      className="w-full accent-orange-accent bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>

                  {/* Botão de Calcular */}
                  <button 
                    type="submit" 
                    disabled={isSimulating}
                    className="w-full btn-orange flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                  >
                    {isSimulating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-lilac-dark border-t-transparent rounded-full animate-spin" />
                        <span>Processando Dados...</span>
                      </>
                    ) : (
                      <>
                        <Percent className="w-4 h-4" />
                        <span>Calcular Probabilidade</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Exibição dos Resultados da Simulação */}
                <AnimatePresence>
                  {simulationResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="mt-6 p-4 rounded-2xl bg-lilac-base/20 border border-white/5 space-y-3 text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/60">Chances de Admissão:</span>
                        <span className={`text-lg font-black ${simulationResult.probability >= 70 ? 'text-green-400' : simulationResult.probability >= 50 ? 'text-yellow-400' : 'text-orange-accent'}`}>
                          {simulationResult.probability}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${simulationResult.probability >= 70 ? 'bg-green-400' : simulationResult.probability >= 50 ? 'bg-yellow-400' : 'bg-orange-accent'}`}
                          style={{ width: `${simulationResult.probability}%` }}
                        />
                      </div>
                      <div className="flex gap-2.5 pt-1">
                        <div className="p-1 bg-white/5 rounded-lg shrink-0 h-fit mt-0.5">
                          <Compass className="w-4 h-4 text-orange-accent" />
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed font-medium">
                          {simulationResult.tip}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* --- 2. CENTRO DE PREPARAÇÃO DE ANGOLA (Design exclusivo com Abas) --- */}
      <section id="prep-hub" className="relative py-24 md:py-32 border-t border-white/5">
        <div className="mx-auto max-w-[1500px] px-6 md:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-3 text-left">
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-orange-accent">Centro de Preparação</p>
              <h2 className="font-display text-3xl md:text-5xl font-black tracking-tighter text-white">
                Escolhe o teu foco de <span className="text-orange-glow">Estudos.</span>
              </h2>
            </div>
            
            {/* Seletor de Foco */}
            <div className="flex bg-lilac-dark/80 border border-white/10 p-1.5 rounded-2xl text-sm font-bold shrink-0 shadow-inner">
              <button 
                onClick={() => setPrepTab("medio")}
                className={`px-5 py-2.5 rounded-xl transition-all duration-300 ${prepTab === "medio" ? "bg-lilac-base text-white border border-white/5" : "text-white/60 hover:text-white"}`}
              >
                Ensino Médio Técnico
              </button>
              <button 
                onClick={() => setPrepTab("superior")}
                className={`px-5 py-2.5 rounded-xl transition-all duration-300 ${prepTab === "superior" ? "bg-orange-accent text-lilac-dark" : "text-white/60 hover:text-white"}`}
              >
                Acesso Universitário
              </button>
            </div>
          </div>

          {/* Conteúdo dinâmico das Abas */}
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Coluna de Destaques do Foco */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="card-lilac-glass p-6 md:p-8 space-y-4 text-left">
                <div className="size-12 rounded-2xl bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center">
                  {prepTab === "medio" ? <BookOpen className="w-6 h-6 text-orange-accent" /> : <GraduationCap className="w-6 h-6 text-orange-accent" />}
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  {prepTab === "medio" ? "ITEL, IPIL, IMEL & INP" : "UAN, ISUTIC & UMN"}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed font-medium">
                  {prepTab === "medio" 
                    ? "Materiais organizados da 10ª à 12ª classe. Consolida disciplinas técnicas como Eletricidade, Eletrónica, Sistemas de Informação e Economia." 
                    : "Simulações oficiais de exames de acesso. Treina com o tempo de exame real e confere as resoluções passo a passo."}
                </p>
              </div>

              <Link 
                href="/exams" 
                className="w-full bg-white/5 border border-white/10 hover:border-orange-accent hover:text-orange-accent py-4 rounded-2xl font-bold transition-all text-center block text-sm shadow-sm"
              >
                {prepTab === "medio" ? "Explorar Livros e Apostilas" : "Treinar com Exames de Acesso"}
              </Link>
            </div>

            {/* Showcase Visual do Material */}
            <div className="lg:col-span-7">
              <div className="relative h-64 md:h-full min-h-[280px] md:min-h-[420px] rounded-3xl overflow-hidden border border-white/10 bg-lilac-dark/50">
                <img 
                  src={prepTab === "medio" ? "/WhatsApp Image 2026-06-22 at 15.36.43 (12).jpeg" : "/WhatsApp Image 2026-06-22 at 15.36.43.jpeg"} 
                  alt="Preparatório APROVEI" 
                  className="absolute inset-0 w-full h-full object-cover opacity-85" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lilac-dark/95 via-lilac-dark/45 to-transparent" />
                
                {/* Overlay Informativo */}
                <div className="absolute bottom-0 left-0 p-4 md:p-10 text-left space-y-1.5 max-w-xl">
                  <span className="bg-orange-accent text-lilac-dark text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-md">
                    Destaque Curricular
                  </span>
                  <h4 className="text-lg md:text-3xl font-black leading-tight">
                    {prepTab === "medio" 
                      ? "Matérias técnicas com resoluções explicadas" 
                      : "Preparatório Intensivo Filda-Ready"}
                  </h4>
                  <p className="text-[11px] md:text-sm text-white/85 leading-relaxed font-medium">
                    {prepTab === "medio"
                      ? "Acede a exames e apontamentos das maiores instituições técnicas de Luanda e arredores."
                      : "Foca no que cai: limites, mecânica newtoniana, ecologia e história de Angola."}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* --- 3. SIMULADO RÁPIDO INTERATIVO (Inovação Exclusiva APROVEI) --- */}
      <section id="interactive-quiz" className="relative py-24 md:py-32 border-t border-white/5 bg-lilac-dark/30">
        <div className="mx-auto max-w-[1500px] px-6 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-left">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-orange-accent">Desafio do Dia</p>
            <h2 className="font-display text-3xl md:text-5xl font-black tracking-tighter text-white">
              Testa os teus conhecimentos <span className="text-orange-glow">agora mesmo.</span>
            </h2>
            <p className="text-base text-white/70 leading-relaxed font-medium">
              Os exames de admissão angolanos costumam ter rasteiras teóricas. Consegues resolver esta questão clássica de Matemática da UAN? Escolhe uma opção e confere se estás pronto!
            </p>
            <div className="flex gap-4 items-center pt-2">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="size-10 rounded-full border-2 border-lilac-dark bg-orange-accent text-lilac-dark font-black text-xs flex items-center justify-center shadow-lg">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-white/60">Mais de 15,000 estudantes já resolveram este mini-teste.</p>
            </div>
          </div>

          {/* Cartão do Teste */}
          <div className="card-lilac-glass p-6 md:p-8 bg-lilac-dark border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black text-orange-accent uppercase tracking-widest">Matemática — UAN</span>
              <HelpCircle className="w-5 h-5 text-white/40" />
            </div>

            <p className="text-base md:text-lg font-bold leading-relaxed mb-6 text-left">
              Qual é o valor do limite de <span className="text-orange-accent font-bold">(1 + 1/x)<sup>x</sup></span> quando <span className="text-orange-accent font-bold">x</span> tende para o infinito?
            </p>

            <div className="space-y-3">
              {[
                { label: "A) 0", id: 0 },
                { label: "B) 1", id: 1 },
                { label: "C) e (Constante de Euler)", id: 2 },
                { label: "D) Infinito", id: 3 }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleAnswerClick(opt.id)}
                  disabled={quizStatus !== "idle"}
                  className={`w-full text-left px-5 py-4 rounded-xl font-bold text-sm transition-all border flex justify-between items-center ${
                    selectedAnswer === opt.id
                      ? opt.id === 2
                        ? "bg-green-500/20 border-green-500 text-green-400"
                        : "bg-rose-500/20 border-rose-500 text-rose-400"
                      : "bg-lilac-base/20 border-white/5 hover:border-white/20 text-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedAnswer === opt.id && (
                    opt.id === 2 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Mensagem de Feedback */}
            <AnimatePresence>
              {quizStatus !== "idle" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 p-4 rounded-2xl bg-lilac-base/30 border border-white/5 space-y-3 text-left"
                >
                  <p className="text-sm font-bold text-white">
                    {quizStatus === "correct" 
                      ? "🎉 Excelente! Resposta Correta!" 
                      : "❌ Ah, quase! Essa não é a opção certa."}
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {quizStatus === "correct"
                      ? "Este é um limite fundamental. Ele define o número de Euler (e ≈ 2.718). Cai quase todos os anos nas provas de Engenharia da UAN e ISUTIC."
                      : "Dica: Revisa a matéria de Limites Notáveis. Lembra-te de que este limite específico define uma constante matemática fundamental."}
                  </p>
                  <button 
                    onClick={handleResetQuiz}
                    className="text-xs font-black text-orange-accent hover:underline flex items-center gap-1 mt-1"
                  >
                    Tentar Novamente
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </section>

      {/* --- 4. MÓDULOS INTEGRADOS (Layout limpo, margin controlada) --- */}
      <section id="solucoes" className="relative py-24 md:py-32 border-t border-white/5">
        <div className="mx-auto max-w-[1500px] px-6 md:px-8">
          
          <div className="space-y-4 text-left">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-orange-accent">O que oferecemos</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tighter text-white">
              Tudo para a tua <span className="text-orange-glow">Evolução.</span>
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                title: "Banco de Provas", 
                desc: "Centenas de exames oficiais anteriores resolvidos por professores qualificados.", 
                image: "/WhatsApp Image 2026-06-22 at 15.36.43 (2).jpeg",
                link: "/exams" 
              },
              { 
                title: "Explicadores Particulares", 
                desc: "Contacta diretamente explicadores qualificados perto de ti via WhatsApp.", 
                image: "/WhatsApp Image 2026-06-22 at 15.36.43 (3).jpeg",
                link: "/teachers" 
              },
              { 
                title: "Tutor IA Permanente", 
                desc: "Explicações detalhadas de fórmulas e teorias do currículo de Angola 24/7.", 
                image: "/WhatsApp Image 2026-06-22 at 15.36.43 (4).jpeg",
                link: "/ai-chat" 
              }
            ].map((sol, i) => (
              <div 
                key={sol.title} 
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-lilac-base/20 backdrop-blur-md hover:border-orange-accent/30 transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 md:h-64 overflow-hidden">
                    <img 
                      src={sol.image} 
                      alt={sol.title} 
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-lilac-dark/30" />
                  </div>
                  <div className="p-6 space-y-2 text-left">
                    <h3 className="font-display text-xl font-bold tracking-tight text-white">{sol.title}</h3>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">{sol.desc}</p>
                  </div>
                </div>
                <div className="p-6 pt-0 text-left">
                  <Link 
                    href={sol.link}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-accent group-hover:underline"
                  >
                    Aceder agora
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- 5. AI INTERACTIVE CHAT SHOWCASE (Visual premium e tecnológico) --- */}
      <section id="ai-showcase" className="relative py-24 md:py-32 border-t border-white/5 bg-black/5">
        <div className="mx-auto max-w-[1500px] px-6 md:px-8">
          <div className="card-lilac-glass p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 border-orange-accent/20">
            {/* Efeito luminoso de fundo */}
            <div className="absolute -top-1/2 -right-1/4 size-[500px] bg-orange-accent/10 rounded-full blur-[120px] animate-pulse-slow" />

            {/* Conteúdo Esquerda */}
            <div className="lg:w-5/12 space-y-6 relative z-10 text-left">
              <div className="inline-flex items-center gap-2 rounded-xl bg-lilac-dark/60 border border-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                <BrainCircuit className="w-4 h-4 text-orange-accent" />
                <span className="text-beam-effect uppercase tracking-wide">Tecnologia Integrada</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-black leading-tight text-white">
                Apresentamos a <br />
                <span className="text-orange-glow">APROVEI IA.</span>
              </h2>
              <p className="text-white/70 text-base md:text-lg leading-relaxed font-medium">
                Um tutor de Inteligência Artificial desenhado especificamente para te ajudar com os programas letivos e exames de admissão em Angola. Resoluções instantâneas de Matemática, Física e mais.
              </p>
              <Link 
                href="/ai-chat" 
                className="btn-orange inline-flex items-center justify-center gap-2.5 rounded-full"
              >
                <Bot className="w-5 h-5 text-lilac-dark" />
                <span className="text-lilac-dark font-bold">Falar com o Tutor</span>
              </Link>
            </div>

            {/* Mockup Chat Direita */}
            <div className="lg:w-7/12 w-full relative z-10">
              <div className="bg-lilac-dark/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                
                {/* Header do Chat */}
                <div className="flex gap-4 items-center mb-6 border-b border-white/5 pb-4">
                  <div className="size-11 rounded-full bg-orange-accent flex items-center justify-center shadow-[0_0_12px_rgba(255,107,0,0.4)]">
                    <Bot className="w-6 h-6 text-lilac-dark" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-white">APROVEI IA</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-orange-accent animate-pulse" />
                      <p className="text-xs text-orange-accent/80 font-bold">Tutor Online</p>
                    </div>
                  </div>
                </div>

                {/* Balões do Chat */}
                <div className="space-y-4">
                  <div className="bg-lilac-base/40 border border-white/5 text-white p-4.5 rounded-2xl rounded-tl-sm max-w-[85%] text-sm font-medium text-left">
                    Olá! Sou o teu Tutor IA. Qual é o problema matemático ou dúvida académica que queres resolver hoje?
                  </div>
                  <div className="bg-orange-accent text-lilac-dark p-4.5 rounded-2xl rounded-tr-sm max-w-[80%] ml-auto text-sm font-bold shadow-[0_4px_15px_rgba(255,107,0,0.35)] text-left">
                    Como resolvo x² - 5x + 6 = 0 usando a fórmula geral?
                  </div>
                  <div className="bg-lilac-base/40 border border-white/5 text-white p-4.5 rounded-2xl rounded-tl-sm max-w-[90%] text-sm font-medium leading-relaxed text-left">
                    Identificamos os coeficientes: <span className="text-orange-accent font-bold">a=1, b=-5, c=6</span>. <br />
                    Calculamos o discriminante Δ: <br />
                    <span className="text-orange-accent font-bold">Δ = b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1</span>. <br />
                    As soluções são: <br />
                    <span className="text-orange-accent font-bold">x = (-b ± √Δ) / 2a = (5 ± 1) / 2</span>. <br />
                    Obtemos: <span className="text-orange-accent font-bold">x₁ = 3</span> e <span className="text-orange-accent font-bold">x₂ = 2</span>.
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- 6. SEÇÃO DE ESTATÍSTICAS --- */}
      <section className="w-full px-6 md:px-8 py-20 bg-lilac-dark/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Estudantes ativos", end: 25000, suffix: "+", color: "text-white" },
            { label: "Perguntas respondidas", end: 150000, suffix: "+", color: "text-orange-accent text-orange-glow" },
            { label: "Exercícios no banco", end: 3200, suffix: "+", color: "text-white text-beam-effect" },
            { label: "Professores cadastrados", end: 450, suffix: "+", color: "text-white/80" }
          ].map((stat, i) => (
            <div key={stat.label} className="card-lilac-glass flex flex-col items-center justify-center p-6 text-center hover:-translate-y-1.5 transition-transform duration-300">
              <h3 className={`text-3.5xl md:text-4.5xl font-black ${stat.color} mb-2 font-title`}>
                <CountUp start={0} end={stat.end} duration={2.5} suffix={stat.suffix} enableScrollSpy scrollSpyOnce />
              </h3>
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
