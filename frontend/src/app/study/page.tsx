"use client";
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Plus, Trash, CheckSquare, Square, Award, RefreshCw, Layers, Zap, Shield, Target, Trophy, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyHubPage() {
  // --- Auth State ---
  const [token, setToken] = useState<string | null>(null);

  // --- Gamification State (XP, Levels, Rewards) ---
  const [xp, setXp] = useState(1250); // initial XP
  const level = Math.floor(xp / 1000) + 1;
  const xpForNextLevel = level * 1000;
  const xpProgress = (xp % 1000) / 1000 * 100;

  const gainXp = (amount: number) => {
    setXp(prev => prev + amount);
    // basic confetti for xp gain
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8b5cf6', '#f97316', '#3b82f6']
    });
  };

  // --- 1. Pomodoro Timer State ---
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 2. Study Planner Tasks State ---
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  // --- 3. Flashcards State ---
  const [flashcards, setFlashcards] = useState([
    { q: "Qual é o valor aproximado da aceleração da gravidade terrestre?", a: "g ≈ 9.8 m/s² (nos exames da UAN costuma ser arredondado para 10 m/s²)." },
    { q: "Quem foi o primeiro Reitor da Universidade Agostinho Neto?", a: "Professor Doutor João Filipe Martins, após a independência nacional." },
    { q: "O que diz o Teorema de Pitágoras?", a: "Num triângulo retângulo, a soma dos quadrados dos catetos é igual ao quadrado da hipotenusa: a² + b² = c²." }
  ]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- 4. Progressive Difficulty Simulado State ---
  const [simuladoStarted, setSimuladoStarted] = useState(false);
  const [simuladoScore, setSimuladoScore] = useState<number | null>(null);
  const [simuladoAnswers, setSimuladoAnswers] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState(1); // 1: easy, 2: medium, 3: hard

  // Mock progressive questions based on difficulty
  const mockQuestionsMap: Record<number, any[]> = {
    1: [
      { q: "Se f(x) = 2x + 3, qual é o valor de f(5)?", options: ["10", "13", "15", "8"], correct: 1 },
      { q: "Um carro percorre 150 km em 2 horas. Qual foi a sua velocidade média?", options: ["50 km/h", "75 km/h", "100 km/h", "60 km/h"], correct: 1 }
    ],
    2: [
      { q: "Determine a derivada de f(x) = 3x² + 2x - 5.", options: ["6x + 2", "3x + 2", "6x - 5", "x² + 2x"], correct: 0 },
      { q: "Qual é o limite de (sin x)/x quando x tende a 0?", options: ["0", "∞", "1", "Não existe"], correct: 2 }
    ],
    3: [
      { q: "Calcule a integral de e^(2x) dx.", options: ["e^(2x) + C", "2e^(2x) + C", "(1/2)e^(2x) + C", "e^x + C"], correct: 2 },
      { q: "Na equação diferencial y'' - 4y = 0, qual é a solução geral?", options: ["c1 e^(2x) + c2 e^(-2x)", "c1 cos(2x) + c2 sin(2x)", "c1 e^x + c2 e^(-x)", "c1 + c2 e^(4x)"], correct: 0 }
    ]
  };

  const currentQuestions = mockQuestionsMap[difficulty] || mockQuestionsMap[1];

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchTasks(storedToken);
    }
  }, []);

  // --- Pomodoro Effects & Logic ---
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            clearInterval(intervalRef.current!);
            
            if (timerType === 'focus') {
              gainXp(50); // XP reward for focus session
              alert("Sessão de foco concluída! Ganhaste +50 XP!");
            }
            
            resetTimer();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds, timerType]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  
  const changeTimerType = (type: string) => {
    setIsActive(false);
    setTimerType(type);
    if (type === 'focus') {
      setMinutes(25);
    } else if (type === 'shortBreak') {
      setMinutes(5);
    } else if (type === 'longBreak') {
      setMinutes(15);
    }
    setSeconds(0);
  };

  const resetTimer = () => {
    setIsActive(false);
    changeTimerType(timerType);
  };

  // --- Study Planner Tasks API ---
  const fetchTasks = async (authToken: string) => {
    try {
      const res = await api.get('/study/tasks', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Erro ao buscar tarefas", err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !token) return;

    try {
      await api.post('/study/tasks', {
        title: newTaskTitle,
        description: newTaskDesc || null,
        due_date: newTaskDue ? new Date(newTaskDue).toISOString() : null,
        completed: false
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDue('');
      fetchTasks(token);
    } catch (err) {
      console.error("Erro ao adicionar tarefa", err);
    }
  };

  const handleToggleTask = async (task: any) => {
    if (!token) return;
    try {
      await api.put(`/study/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        completed: !task.completed
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!task.completed) {
        gainXp(20); // XP reward for task
      }
      
      fetchTasks(token);
    } catch (err) {
      console.error("Erro ao atualizar tarefa", err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!token) return;
    try {
      await api.delete(`/study/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTasks(token);
    } catch (err) {
      console.error("Erro ao apagar tarefa", err);
    }
  };

  // --- Flashcard Logic ---
  const flipCard = () => setIsFlipped(!isFlipped);
  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((cardIndex + 1) % flashcards.length);
    }, 200);
  };
  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCardIndex((cardIndex - 1 + flashcards.length) % flashcards.length);
    }, 200);
  };

  // --- Simulado Logic ---
  const startSimulado = (lvl: number) => {
    if (level < lvl) {
      alert("Nível insuficiente! Precisas de mais XP para desbloquear esta dificuldade.");
      return;
    }
    setDifficulty(lvl);
    setSimuladoStarted(true);
    setSimuladoScore(null);
    setSimuladoAnswers(new Array(mockQuestionsMap[lvl].length).fill(-1));
  };

  const handleSelectSimuladoAnswer = (questionIndex: number, optionIndex: number) => {
    const updated = [...simuladoAnswers];
    updated[questionIndex] = optionIndex;
    setSimuladoAnswers(updated);
  };

  const finishSimulado = () => {
    let score = 0;
    currentQuestions.forEach((q, idx) => {
      if (simuladoAnswers[idx] === q.correct) {
        score += 1;
      }
    });
    setSimuladoScore(score);
    
    if (score === currentQuestions.length) {
      gainXp(difficulty * 100); // progressive XP reward
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } }
  };


  return (
    <div className="space-y-12 pb-20 relative max-w-[1600px] mx-auto px-4 md:px-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full filter blur-[150px] -z-10 pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-accent/15 rounded-full filter blur-[150px] -z-10 pointer-events-none mix-blend-screen"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 font-title tracking-tight">
            <div className="p-3 bg-gradient-to-tr from-primary to-secondary rounded-2xl text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              <Target className="w-8 h-8" />
            </div>
            <span>Training Center</span>
          </h2>
          <p className="text-text-muted font-medium mt-3 text-lg">Desenvolve foco, acumula XP e desbloqueia desafios avançados.</p>
        </div>

        {/* Gamification Hub Widget */}
        <div className="bg-surface/50 backdrop-blur-3xl border border-white/10 p-5 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent group-hover:from-primary/10 transition-colors"></div>
          <div className="flex flex-col justify-center items-center px-4 border-r border-white/10">
            <Trophy className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] mb-1" />
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Nível</span>
            <span className="text-2xl font-black text-white">{level}</span>
          </div>
          <div className="flex flex-col w-48">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Experiência</span>
              <span className="text-sm font-black text-primary-light flex items-center gap-1"><Zap className="w-3 h-3 fill-current" /> {xp} / {xpForNextLevel}</span>
            </div>
            <div className="h-2 w-full bg-surface-light rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-secondary relative"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-8 lg:grid-cols-12"
      >
        {/* Left Column: Pomodoro & Simulator */}
        <div className="lg:col-span-7 space-y-8">
          {/* Pomodoro widget */}
          <motion.div variants={itemVariants} className="bg-surface/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] space-y-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700 blur-2xl"></div>
            
            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2 font-title">
              <span>Foco & Recompensa</span>
            </h3>

            {/* Timer Pills */}
            <div className="flex justify-center flex-wrap gap-3">
              <button
                onClick={() => changeTimerType('focus')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border border-white/5 ${timerType === 'focus' ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-surface-light text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                Sessão Foco (25m) <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white">+50 XP</span>
              </button>
              <button
                onClick={() => changeTimerType('shortBreak')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border border-white/5 ${timerType === 'shortBreak' ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-surface-light text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                Pausa Curta (5m)
              </button>
              <button
                onClick={() => changeTimerType('longBreak')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border border-white/5 ${timerType === 'longBreak' ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-surface-light text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                Pausa Longa (15m)
              </button>
            </div>

            {/* Timer Output */}
            <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tabular-nums py-4 tracking-tighter drop-shadow-sm font-title">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Timer controls */}
            <div className="flex justify-center gap-6">
              {isActive ? (
                <button
                  onClick={pauseTimer}
                  className="bg-gradient-to-tr from-amber-500 to-orange-400 text-white p-5 rounded-full hover:scale-110 transition-transform shadow-[0_0_30px_rgba(245,158,11,0.5)]"
                >
                  <Pause className="w-8 h-8" />
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="bg-gradient-to-tr from-primary to-secondary text-white p-5 rounded-full hover:scale-110 transition-transform shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                >
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </button>
              )}
              <button
                onClick={resetTimer}
                className="bg-surface-light border border-white/10 text-white/50 p-5 rounded-full hover:bg-white/5 hover:text-white hover:scale-110 transition-all shadow-inner"
              >
                <RotateCcw className="w-8 h-8" />
              </button>
            </div>
          </motion.div>

          {/* Progressive Simulado widget */}
          <motion.div variants={itemVariants} className="bg-surface/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] space-y-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 font-title">
              <div className="p-2 bg-rose-500/20 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)] rounded-xl">
                <Shield className="w-6 h-6 text-rose-400" />
              </div>
              <span>Simulador Progressivo</span>
            </h3>

            {!simuladoStarted ? (
              <div className="space-y-6">
                <p className="text-text-muted text-sm font-medium leading-relaxed bg-surface-light/50 p-5 rounded-2xl border border-white/5 shadow-inner">
                  O simulador adapta-se ao teu nível. Desbloqueia novas dificuldades acumulando XP para enfrentar exames mais difíceis.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { lvl: 1, title: 'Iniciante', xp: 0, reward: 100 },
                    { lvl: 2, title: 'Intermediário', xp: 2000, reward: 200 },
                    { lvl: 3, title: 'Avançado', xp: 4000, reward: 300 }
                  ].map((d) => (
                    <button
                      key={d.lvl}
                      onClick={() => startSimulado(d.lvl)}
                      className={`relative flex flex-col items-center p-6 rounded-2xl border transition-all ${
                        level >= d.lvl 
                          ? 'bg-surface-light/50 border-white/10 hover:border-rose-500/50 hover:bg-white/5 cursor-pointer group' 
                          : 'bg-surface opacity-50 border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {level < d.lvl && <Lock className="absolute top-4 right-4 w-4 h-4 text-white/30" />}
                      <span className={`text-sm font-bold uppercase tracking-widest mb-2 ${level >= d.lvl ? 'text-rose-400' : 'text-white/30'}`}>Nível {d.lvl}</span>
                      <span className={`text-lg font-black mb-1 ${level >= d.lvl ? 'text-white' : 'text-white/40'}`}>{d.title}</span>
                      <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/50 font-bold border border-white/5">+{d.reward} XP</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {currentQuestions.map((q, qIdx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: qIdx * 0.1 }}
                    key={qIdx} 
                    className="space-y-4 bg-surface-light/30 p-6 rounded-2xl border border-white/5 shadow-inner"
                  >
                    <p className="font-bold text-white text-base flex gap-3">
                      <span className="text-rose-400 font-black">{qIdx + 1}.</span> {q.q}
                    </p>
                    <div className="grid gap-3">
                      {q.options.map((opt: string, oIdx: number) => (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectSimuladoAnswer(qIdx, oIdx)}
                          className={`text-left px-5 py-4 rounded-xl text-sm font-bold transition-all border ${
                            simuladoAnswers[qIdx] === oIdx
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                              : 'bg-surface border-white/5 hover:border-white/20 text-white/70 shadow-sm'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {simuladoScore === null ? (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={finishSimulado}
                      disabled={simuladoAnswers.includes(-1)}
                      className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:transform-none disabled:hover:shadow-none text-base"
                    >
                      Submeter Missão
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-surface-light border border-white/10 rounded-[2rem] text-center space-y-6 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent blur-2xl"></div>
                    <div className="relative z-10 space-y-6">
                      <h4 className="text-xl font-black text-white font-title">Resultado da Missão</h4>
                      <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 drop-shadow-sm font-title">
                        {simuladoScore} / {currentQuestions.length}
                      </p>
                      <p className="text-sm font-medium text-white/70">
                        {simuladoScore === currentQuestions.length ? `Perfeito! Ganhaste +${difficulty * 100} XP.` : "Quase lá! Revisa a matéria e tenta novamente para ganhares XP."}
                      </p>
                      <button
                        onClick={() => setSimuladoStarted(false)}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-inner"
                      >
                        Voltar ao Menu de Dificuldade
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Flashcard flipper & Tasks list */}
        <div className="lg:col-span-5 space-y-8">
          {/* Flashcard Widget */}
          <motion.div variants={itemVariants} className="bg-surface/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] space-y-6" style={{ perspective: "1000px" }}>
            <h3 className="text-2xl font-black text-white flex items-center gap-3 font-title">
              <div className="p-2 bg-secondary/20 rounded-xl border border-secondary/20 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <Layers className="w-6 h-6 text-secondary-light" />
              </div>
              <span>Cartões de Memória</span>
            </h3>

            {/* Flipper Card Container */}
            <motion.div
              onClick={flipCard}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              className="h-64 rounded-3xl p-8 cursor-pointer relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_40px_rgba(236,72,153,0.2)] transition-shadow"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Side */}
              <div 
                className="absolute inset-0 bg-surface-light border border-white/10 rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-inner"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-xs text-secondary-light font-bold uppercase tracking-widest bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-full">
                  Pergunta
                </div>
                <div className="font-black text-white text-xl md:text-2xl leading-tight font-title">
                  {flashcards[cardIndex].q}
                </div>
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider animate-pulse">
                  Clica para ver a resposta
                </div>
              </div>

              {/* Back Side */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary to-secondary text-white rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-inner"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-xs text-white/80 font-bold uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">
                  Resposta
                </div>
                <div className="font-bold text-white text-lg md:text-xl leading-relaxed">
                  {flashcards[cardIndex].a}
                </div>
                <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                  Clica para virar
                </div>
              </div>
            </motion.div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-sm text-text-muted font-bold bg-surface-light px-3 py-1 rounded-lg border border-white/5">
                {cardIndex + 1} / {flashcards.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={prevCard}
                  className="px-4 py-2 bg-surface-light border border-white/5 rounded-xl text-sm font-bold hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={nextCard}
                  className="px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors shadow-md"
                >
                  Próximo
                </button>
              </div>
            </div>
          </motion.div>

          {/* Study Planner task list */}
          <motion.div variants={itemVariants} className="bg-surface/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-white font-title">Missões Diárias</h3>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">+20 XP por Missão</span>
            </div>

            {token ? (
              <div className="space-y-6">
                {/* Form to add task */}
                <form onSubmit={handleAddTask} className="space-y-3 bg-surface-light/30 p-4 rounded-2xl border border-white/5 shadow-inner">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Resolver exames de Química 2024"
                    className="w-full px-4 py-3 bg-surface border border-white/5 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none text-white placeholder:text-white/30 transition-all shadow-inner"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="px-4 py-3 bg-surface border border-white/5 rounded-xl focus:border-primary/50 focus:ring-2 focus:ring-primary/20 text-sm font-medium outline-none text-white flex-1 transition-all shadow-inner [color-scheme:dark]"
                      value={newTaskDue}
                      onChange={e => setNewTaskDue(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white px-5 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nova</span>
                    </button>
                  </div>
                </form>

                {/* Tasks List */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-surface-light rounded-full border border-white/5 shadow-inner flex items-center justify-center mx-auto mb-3">
                        <CheckSquare className="w-8 h-8 text-white/20" />
                      </div>
                      <p className="text-sm font-bold text-white/40">Sem missões definidas.</p>
                      <p className="text-xs font-medium text-white/30 mt-1">Ganha XP definindo os teus estudos hoje!</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {tasks.map((task) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={task.id} 
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${task.completed ? 'bg-surface border-white/5 opacity-60' : 'bg-surface-light border-white/10 shadow-sm hover:border-primary/30 hover:bg-white/5'}`}
                        >
                          <div
                            onClick={() => handleToggleTask(task)}
                            className="flex items-center gap-3 cursor-pointer text-left flex-1"
                          >
                            {task.completed ? (
                              <div className="bg-emerald-500/20 rounded-lg p-1 border border-emerald-500/30">
                                <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                              </div>
                            ) : (
                              <div className="bg-surface rounded-lg p-1 border border-white/10">
                                <Square className="w-5 h-5 text-white/30 shrink-0" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className={`text-sm font-bold truncate transition-colors ${task.completed ? 'line-through text-text-muted' : 'text-white'}`}>
                                {task.title}
                              </p>
                              {task.due_date && (
                                <p className="text-[11px] font-bold text-primary-light mt-0.5">
                                  Prazo: {new Date(task.due_date).toLocaleDateString('pt-AO')}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-white/20 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors ml-2"
                          >
                            <Trash className="w-4.5 h-4.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-surface-light/50 rounded-2xl text-center border border-white/5 flex flex-col items-center shadow-inner">
                <div className="w-16 h-16 bg-surface rounded-full shadow-inner border border-white/10 flex items-center justify-center mb-4">
                  <CheckSquare className="w-8 h-8 text-primary-light" />
                </div>
                <p className="text-sm text-text-muted font-medium mb-4">
                  Para guardares as tuas missões e acumular XP, precisas de fazer login.
                </p>
                <a href="/auth/login" className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition shadow-[0_0_15px_rgba(255,255,255,0.2)] w-full">
                  Fazer Login
                </a>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
