"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Zap, Clock, ChevronRight, Check, X, Award, BarChart3, RefreshCcw, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Rich Mock questions grouped by subject
const QUESTIONS_BY_SUBJECT: Record<string, Array<{
  id: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  text: string;
  options: string[];
  correctIndex: number;
  topic: string;
}>> = {
  Matemática: [
    { id: 1, difficulty: 'Fácil', text: 'Num triângulo retângulo, qual é o teorema que relaciona os catetos com a hipotenusa?', options: ['Teorema de Tales', 'Teorema de Pitágoras', 'Lei dos Senos', 'Teorema de Euler'], correctIndex: 1, topic: 'Geometria' },
    { id: 2, difficulty: 'Médio', text: 'Qual é o valor da derivada da função f(x) = x^3 + 2x^2 - 5 no ponto x = 1?', options: ['5', '7', '9', '11'], correctIndex: 1, topic: 'Cálculo' },
    { id: 3, difficulty: 'Difícil', text: 'Qual é a integral definida de f(x) = 2x no intervalo [0, 2]?', options: ['2', '4', '6', '8'], correctIndex: 1, topic: 'Cálculo' },
    { id: 4, difficulty: 'Médio', text: 'Se log(x) = 2 e log(y) = 3, qual é o valor de log(x * y)?', options: ['5', '6', '1', '1.5'], correctIndex: 0, topic: 'Álgebra' },
    { id: 5, difficulty: 'Difícil', text: 'Numa progressão geométrica onde a1 = 2 e q = 3, qual é o 4º termo?', options: ['18', '54', '162', '24'], correctIndex: 1, topic: 'Progressões' }
  ],
  Física: [
    { id: 1, difficulty: 'Fácil', text: 'Qual é a unidade de medida da força no Sistema Internacional (SI)?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], correctIndex: 2, topic: 'Mecânica' },
    { id: 2, difficulty: 'Médio', text: 'Um automóvel viaja a 72 km/h. Qual é a sua velocidade equivalente em metros por segundo (m/s)?', options: ['10 m/s', '15 m/s', '20 m/s', '25 m/s'], correctIndex: 2, topic: 'Cinemática' },
    { id: 3, difficulty: 'Médio', text: 'A primeira lei da termodinâmica expressa o princípio da conservação de:', options: ['Massa', 'Energia', 'Temperatura', 'Pressão'], correctIndex: 1, topic: 'Termodinâmica' },
    { id: 4, difficulty: 'Difícil', text: 'Qual é a resistência equivalente de dois resistores de 10 Ohms ligados em paralelo?', options: ['5 Ohms', '10 Ohms', '20 Ohms', '15 Ohms'], correctIndex: 0, topic: 'Eletricidade' },
    { id: 5, difficulty: 'Difícil', text: 'Um corpo é lançado verticalmente para cima com velocidade de 30 m/s. Considerando g = 10 m/s^2, qual a altura máxima alcançada?', options: ['30 m', '45 m', '90 m', '15 m'], correctIndex: 1, topic: 'Mecânica' }
  ],
  Química: [
    { id: 1, difficulty: 'Fácil', text: 'Qual é o pH de uma solução neutra a 25 °C?', options: ['0', '7', '14', '1'], correctIndex: 1, topic: 'Soluções' },
    { id: 2, difficulty: 'Médio', text: 'Qual elemento químico tem o símbolo "O" na tabela periódica?', options: ['Ouro', 'Osmio', 'Oxigénio', 'Oligopólio'], correctIndex: 2, topic: 'Tabela Periódica' },
    { id: 3, difficulty: 'Médio', text: 'Qual é o composto cuja fórmula molecular é H2O?', options: ['Água', 'Álcool Etílico', 'Ácido Clorídrico', 'Amónia'], correctIndex: 0, topic: 'Química Geral' },
    { id: 4, difficulty: 'Difícil', text: 'Uma ligação química caracterizada pela partilha de pares de eletrões chama-se ligação:', options: ['Iónica', 'Covalente', 'Metálica', 'De Hidrogénio'], correctIndex: 1, topic: 'Ligações Químicas' },
    { id: 5, difficulty: 'Difícil', text: 'Qual é a massa molar aproximada do gás carbónico (CO2) em g/mol (C=12, O=16)?', options: ['28 g/mol', '32 g/mol', '44 g/mol', '56 g/mol'], correctIndex: 2, topic: 'Estequiometria' }
  ],
  História: [
    { id: 1, difficulty: 'Fácil', text: 'Em que ano foi proclamada a Independência de Angola?', options: ['1975', '1961', '1992', '2002'], correctIndex: 0, topic: 'História de Angola' },
    { id: 2, difficulty: 'Médio', text: 'Quem foi o primeiro Presidente da República de Angola?', options: ['José Eduardo dos Santos', 'Dr. António Agostinho Neto', 'Jonas Savimbi', 'Holden Roberto'], correctIndex: 1, topic: 'História de Angola' },
    { id: 3, difficulty: 'Médio', text: 'A Conferência de Berlim (1884-1885) teve como objetivo principal:', options: ['A abolição da escravatura', 'A partilha de África pelas potências europeias', 'A paz mundial', 'A descolonização da América'], correctIndex: 1, topic: 'História Geral' },
    { id: 4, difficulty: 'Difícil', text: 'Qual destas efemérides marca o início da Luta Armada de Libertação Nacional em Angola?', options: ['4 de Fevereiro de 1961', '11 de Novembro de 1975', '25 de Abril de 1974', '4 de Abril de 2002'], correctIndex: 0, topic: 'História de Angola' },
    { id: 5, difficulty: 'Difícil', text: 'Que tratado pôs fim à Primeira Guerra Mundial em 1919?', options: ['Tratado de Tordesilhas', 'Tratado de Versalhes', 'Tratado de Utrecht', 'Tratado de Madrid'], correctIndex: 1, topic: 'História Geral' }
  ],
  Biologia: [
    { id: 1, difficulty: 'Fácil', text: 'Qual é a organela celular responsável pela respiração aeróbica e produção de ATP?', options: ['Complexo de Golgi', 'Mitocôndria', 'Ribossoma', 'Lisossoma'], correctIndex: 1, topic: 'Citologia' },
    { id: 2, difficulty: 'Médio', text: 'Qual cientista é considerado o pai da genética moderna por suas experiências com ervilhas?', options: ['Charles Darwin', 'Louis Pasteur', 'Gregor Mendel', 'Jean-Baptiste Lamarck'], correctIndex: 2, topic: 'Genética' },
    { id: 3, difficulty: 'Médio', text: 'O processo de divisão celular que resulta em 4 células-filhas haploides chama-se:', options: ['Meiose', 'Mitose', 'Bipartição', 'Clonagem'], correctIndex: 0, topic: 'Citologia' },
    { id: 4, difficulty: 'Difícil', text: 'Qual é o principal pigmento responsável pela fotossíntese nas plantas?', options: ['Clorofila', 'Caroteno', 'Xantofila', 'Melanina'], correctIndex: 0, topic: 'Fisiologia Vegetal' },
    { id: 5, difficulty: 'Difícil', text: 'Que tipo de ácido nucleico contém a informação genética sob a forma de uma dupla hélice?', options: ['RNA', 'DNA', 'Proteína', 'Lípido'], correctIndex: 1, topic: 'Biologia Molecular' }
  ],
  Geografia: [
    { id: 1, difficulty: 'Fácil', text: 'Qual é o rio mais longo que banha inteiramente o território angolano?', options: ['Rio Kwanza', 'Rio Congo', 'Rio Zambeze', 'Rio Cunene'], correctIndex: 0, topic: 'Hidrografia de Angola' },
    { id: 2, difficulty: 'Médio', text: 'Qual é a montanha mais alta de Angola?', options: ['Monte Moco', 'Serra da Chela', 'Planalto Central', 'Monte Lubango'], correctIndex: 0, topic: 'Relevo de Angola' },
    { id: 3, difficulty: 'Médio', text: 'Qual é o deserto situado no sudoeste de Angola?', options: ['Deserto do Saara', 'Deserto do Namibe', 'Deserto de Kalahari', 'Deserto de Atacama'], correctIndex: 1, topic: 'Geografia Física' },
    { id: 4, difficulty: 'Difícil', text: 'Com que país Angola faz fronteira a sul?', options: ['RDC', 'Zâmbia', 'Namíbia', 'Congo-Brazzaville'], correctIndex: 2, topic: 'Fronteiras de Angola' },
    { id: 5, difficulty: 'Difícil', text: 'Qual é a maior província de Angola em termos de extensão territorial?', options: ['Luanda', 'Moxico', 'Cuando Cubango', 'Huíla'], correctIndex: 1, topic: 'Geografia Humana' }
  ]
};

export default function SimulationPage() {
  const router = useRouter();
  const [configMode, setConfigMode] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('Matemática');
  const [targetScore, setTargetScore] = useState(15);
  
  // Simulation State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const questions = QUESTIONS_BY_SUBJECT[selectedSubject] || QUESTIONS_BY_SUBJECT['Matemática'];

  const startSimulation = () => {
    setConfigMode(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswered(true);
    const correct = selectedAnswer === questions[currentQuestionIndex].correctIndex;
    
    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setIsFinished(true);
      }
    }, 2000);
  };

  if (configMode) {
    return (
      <div className="w-full max-w-full overflow-hidden px-4 py-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-10rem)] sm:min-h-[80vh] relative z-10">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-lilac-light/10 rounded-full filter blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-orange/5 rounded-full filter blur-[120px] -z-10 pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-xl max-w-2xl w-full z-10 relative overflow-hidden text-left p-5 sm:p-10 rounded-[2rem]"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Brain className="w-48 h-48 text-white" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange text-sm font-bold mb-6 border border-orange/25 shadow-sm">
            <Zap className="w-4 h-4 text-orange animate-pulse" />
            <span>Motor Adaptativo APROVEI</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 font-title">Simulador IA Dinâmico</h1>
          <p className="text-white/70 text-sm sm:text-base font-medium mb-10 max-w-lg">
            Configura a tua sessão. A IA vai analisar o teu perfil, evitar perguntas repetidas e aumentar a dificuldade gradualmente conforme o teu progresso.
          </p>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Disciplina Alvo</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Matemática', 'Física', 'Química', 'História', 'Biologia', 'Geografia'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border ${
                      selectedSubject === sub 
                        ? 'bg-orange text-lilac-dark border-orange shadow-[0_0_15px_rgba(255,107,0,0.3)]' 
                        : 'bg-lilac-dark/40 text-white/60 border-lilac-light/20 hover:border-orange/40 hover:bg-lilac-dark/60 hover:text-white'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Meta de Pontuação (Objectivo)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="5" 
                  max="20" 
                  value={targetScore} 
                  onChange={e => setTargetScore(parseInt(e.target.value))}
                  className="flex-1 accent-orange bg-lilac-dark/50"
                />
                <span className="text-2xl font-black text-orange w-12 text-center">{targetScore}</span>
              </div>
            </div>

            <button 
              onClick={startSimulation}
              className="w-full bg-orange text-lilac-dark py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-orange/80 shadow-[0_0_20px_rgba(255,107,0,0.35)] hover:scale-[1.01] transition-all flex items-center justify-center gap-3 mt-4"
            >
              <span>Gerar Simulacro Adaptativo</span>
              <Target className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="w-full max-w-full overflow-hidden px-4 py-6 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] sm:min-h-[80vh] relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-xl max-w-xl w-full text-center relative z-10 p-6 sm:p-10 rounded-[2rem]"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange/30">
            <Award className="w-10 h-10 sm:w-12 sm:h-12 text-lilac-dark" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 font-title">Sessão Concluída!</h2>
          <p className="text-white/60 font-medium mb-8">O motor de IA ajustou o teu nível.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-lilac-dark/40 p-4 sm:p-6 rounded-[2rem] border border-lilac-light/15">
              <p className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Precisão</p>
              <p className={`text-3xl sm:text-4xl font-black ${percentage >= 70 ? 'text-green-400' : 'text-orange-glow'}`}>{percentage}%</p>
            </div>
            <div className="bg-lilac-dark/40 p-4 sm:p-6 rounded-[2rem] border border-lilac-light/15">
              <p className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Acertos</p>
              <p className="text-3xl sm:text-4xl font-black text-orange">{score}/{questions.length}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button 
              onClick={() => router.push('/exams')}
              className="flex-1 bg-lilac-dark/60 text-white font-bold py-4 rounded-2xl hover:bg-lilac-dark/80 transition-colors border border-lilac-light/20 text-sm sm:text-base"
            >
              Voltar aos Exames
            </button>
            <button 
              onClick={() => setConfigMode(true)}
              className="flex-1 bg-orange text-lilac-dark font-bold py-4 rounded-2xl hover:bg-orange/80 shadow-[0_0_15px_rgba(255,107,0,0.35)] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>Novo Simulacro</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 sm:px-6 relative z-10 overflow-hidden rounded-[2rem]">
      
      {/* Background decorations */}
      <div className="absolute top-[10%] right-[-20%] w-[500px] h-[500px] bg-lilac-light/10 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-20%] w-[500px] h-[500px] bg-orange/5 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>

      {/* Header Stats */}
      <div className="flex flex-wrap items-center justify-between mb-6 sm:mb-8 gap-4 bg-lilac-base/20 p-4 rounded-2xl border border-lilac-light/20 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-white/50" />
            <span className="font-bold text-white text-xs sm:text-base">{selectedSubject}</span>
          </div>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4.5 h-4.5 text-orange" />
            <span className="font-bold text-orange text-[10px] sm:text-xs md:text-sm">Nível: {question.difficulty}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4.5 h-4.5 text-orange animate-pulse" />
            <span className="font-bold text-white/75 text-[10px] sm:text-xs md:text-sm">Streak: <span className="text-orange">{streak}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-white/50" />
            <span className="font-bold text-white text-xs sm:text-base">14:59</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-lilac-dark/40 h-2.5 rounded-full overflow-hidden mb-8 sm:mb-12 border border-lilac-light/20">
        <motion.div 
          className="bg-orange h-full rounded-full shadow-[0_0_8px_rgba(255,107,0,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Question Area */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg relative p-5 sm:p-8 md:p-12 text-left rounded-[2rem]"
        >
          <div className="absolute -top-4 sm:-top-5 left-6 sm:left-10 bg-orange text-lilac-dark px-3 sm:px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm shadow-md">
            Questão {currentQuestionIndex + 1} de {questions.length}
          </div>
          
          <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-10 leading-relaxed font-title mt-4">
            {question.text}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {question.options.map((opt, idx) => {
              let btnClass = "bg-lilac-dark/40 border border-lilac-light/20 text-white hover:bg-lilac-dark/60 hover:border-orange/50";
              let icon: React.ReactNode = null;
              
              if (selectedAnswer !== null) {
                if (idx === question.correctIndex) {
                  btnClass = "bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
                  icon = <Check className="w-5 h-5 text-green-500 shrink-0" />;
                } else if (selectedAnswer === idx) {
                  btnClass = "bg-red-500/10 border-red-500 text-red-400";
                  icon = <X className="w-5 h-5 text-red-500 shrink-0" />;
                } else {
                  btnClass = "bg-lilac-dark/20 border-lilac-light/10 text-white/45 opacity-55";
                }
              } else if (selectedAnswer === idx) {
                btnClass = "bg-orange/10 border-orange text-orange";
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswered && setSelectedAnswer(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 sm:p-5 rounded-2xl text-left font-bold transition-all flex items-center justify-between gap-4 group ${btnClass}`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all shrink-0 ${
                      selectedAnswer === idx || (isAnswered && idx === question.correctIndex) 
                        ? 'bg-orange text-lilac-dark border-orange font-black' 
                        : 'bg-lilac-dark/60 border-lilac-light/20 text-white/70'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-base font-medium leading-tight line-clamp-2 whitespace-normal text-left">{opt}</span>
                  </div>
                  {icon}
                </button>
              );
            })}
          </div>

          <div className="mt-8 sm:mt-10 flex justify-end">
            <button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null || isAnswered}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all ${
                selectedAnswer === null || isAnswered
                  ? 'bg-lilac-dark/40 text-white/30 cursor-not-allowed border border-lilac-light/15 shadow-none'
                  : 'bg-orange text-lilac-dark hover:bg-orange/80 shadow-[0_0_15px_rgba(255,107,0,0.35)]'
              }`}
            >
              <span>Submeter Resposta</span>
              <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
