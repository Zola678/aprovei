"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Monitor, 
  LogOut, 
  MessageSquare, 
  Users, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Hand, 
  Maximize2,
  Shield,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const SIMULATED_PARTICIPANTS = [
  { id: 101, name: "Prof. Alberto Kiala", role: "teacher", avatar: "PK", color: "from-orange to-amber-500", speaking: true, hasCam: true },
  { id: 102, name: "Sílvia Manuel", role: "student", avatar: "SM", color: "from-blue-500 to-indigo-500", speaking: false, hasCam: true },
  { id: 103, name: "Carlos Antunes", role: "student", avatar: "CA", color: "from-emerald-500 to-teal-500", speaking: false, hasCam: false },
  { id: 104, name: "Maria Domingos", role: "student", avatar: "MD", color: "from-rose-500 to-pink-500", speaking: false, hasCam: false },
  { id: 105, name: "Bernardo Silva", role: "student", avatar: "BS", color: "from-purple-500 to-violet-500", speaking: false, hasCam: true }
];

const SIMULATED_CHAT_RESPONSES = [
  "Muito boa a iniciativa deste debate!",
  "Concordo totalmente com o raciocínio do Professor Alberto.",
  "Alguém tem o manual da 12ª classe para partilhar aqui?",
  "Ficou muito mais simples entender limites desta forma.",
  "Esse método funciona para qualquer equação quadrática?",
  "APROVEI está a salvar a minha preparação para o exame de acesso da UAN!",
  "Prof. Alberto, pode fazer mais um exemplo no quadro?"
];

export default function StreamRoomPage({ params }: { params: { post_id: string } }) {
  const postId = params.post_id;
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Stream UI states
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [raisedHand, setRaisedHand] = useState(false);
  const [activeLayout, setActiveLayout] = useState<'grid' | 'focus'>('focus');

  // Elapsed Time Counter
  const [seconds, setSeconds] = useState(0);

  // Chat Logic
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "System", content: "Bem-vindo ao canal de streaming do debate Aprovei! A chamada foi iniciada de forma colaborativa.", timestamp: "Agora" },
    { sender: "Prof. Alberto Kiala", content: "Olá a todos! Sejam bem-vindos a esta sala de estudos ao vivo. Hoje vamos tirar dúvidas gerais.", timestamp: "Há 1 min" }
  ]);
  const [newMsg, setNewMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Local camera stream simulator (HTML5 Canvas or animated gradient)
  const localVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));

    const loadData = async () => {
      try {
        const res = await api.get(`/forum/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Erro ao obter debate da stream", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Timer
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Auto-simulate chat responses
    const chatBot = setInterval(() => {
      const randomResponse = SIMULATED_CHAT_RESPONSES[Math.floor(Math.random() * SIMULATED_CHAT_RESPONSES.length)];
      const randomParticipant = SIMULATED_PARTICIPANTS[Math.floor(Math.random() * SIMULATED_PARTICIPANTS.length)];
      
      setChatMessages(prev => [
        ...prev,
        { sender: randomParticipant.name, content: randomResponse, timestamp: "Agora", role: randomParticipant.role }
      ]);
    }, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(chatBot);
    };
  }, [postId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !user) return;
    setChatMessages(prev => [
      ...prev,
      { sender: user.full_name || "Eu", content: newMsg, timestamp: "Agora", isSelf: true }
    ]);
    const userMsg = newMsg;
    setNewMsg("");

    // Simulate tutor response to user's question
    setTimeout(() => {
      let botResponse = "Excelente pergunta! Vamos analisar isso juntos.";
      if (userMsg.toLowerCase().includes("matemática") || userMsg.toLowerCase().includes("calculo") || userMsg.toLowerCase().includes("limite")) {
        botResponse = "Excelente dúvida matemática! No APROVEI focamos em simplificar os limites aplicando as regras fundamentais sem rodeios.";
      } else if (userMsg.toLowerCase().includes("exame") || userMsg.toLowerCase().includes("admissão")) {
        botResponse = "Os exames da UAN e da UMN cobram muito raciocínio rápido. Esta chamada serve justamente para acelerar o teu raciocínio!";
      }
      setChatMessages(prev => [
        ...prev,
        { sender: "Prof. Alberto Kiala", content: botResponse, timestamp: "Agora", role: "teacher" }
      ]);
    }, 2500);
  };

  const handleLeave = async () => {
    if (confirm("Tens a certeza que desejas sair desta chamada ao vivo?")) {
      // If the user is the author, we can optionally end it, otherwise we just leave.
      if (user && post && user.id === post.user_id) {
        if (confirm("Desejas encerrar a chamada para todos ou apenas sair?")) {
          try {
            await api.post(`/forum/${postId}/end-call`);
          } catch (e) {
            console.error(e);
          }
        }
      }
      router.push(`/forum/${postId}`);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lilac-dark text-white flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60 font-semibold tracking-wide">A conectar ao servidor de streaming APROVEI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0914] text-white flex flex-col overflow-hidden relative font-sans">
      
      {/* Background neon ambient glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lilac-light/5 via-transparent to-transparent pointer-events-none -z-10"></div>
      
      {/* Header Bar */}
      <header className="h-16 px-6 bg-lilac-dark/40 border-b border-white/5 backdrop-blur-xl flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-black animate-pulse">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            <span>EM DIRETO</span>
          </div>
          <h2 className="text-sm md:text-base font-bold text-white max-w-xs md:max-w-md truncate">
            {post?.call_title || post?.title || "Chamada de Estudo"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-white/50 text-xs font-bold px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
            <Users className="w-3.5 h-3.5 text-orange" />
            <span>{SIMULATED_PARTICIPANTS.length + 1} Assistindo</span>
          </div>
          <div className="text-white/80 font-mono text-sm font-bold tracking-wider px-3 py-1.5 bg-orange/10 border border-orange/20 rounded-xl text-orange">
            {formatTime(seconds)}
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Stream Screens Area */}
        <div className="flex-1 p-4 flex flex-col justify-center overflow-y-auto relative z-0">
          
          <AnimatePresence mode="wait">
            {activeLayout === 'focus' ? (
              /* FOCUS LAYOUT: Large screen share/presentation + grid below or side */
              <div className="w-full h-full flex flex-col xl:flex-row gap-4">
                
                {/* Main Shared Screen / Presentation Board */}
                <div className="flex-1 bg-lilac-dark/50 border border-white/10 rounded-3xl overflow-hidden relative min-h-[300px] shadow-2xl flex flex-col">
                  {/* Canvas Whiteboard Simulator */}
                  <div className="flex-1 bg-[#150f22] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    
                    {/* Floating subject tags */}
                    <div className="absolute top-4 left-4 bg-orange/10 border border-orange/25 rounded-xl px-3 py-1.5 text-xs text-orange font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>{post?.category || "Matemática"}</span>
                    </div>

                    <div className="absolute top-4 right-4 bg-white/5 rounded-xl px-3 py-1 text-xs text-white/40 font-bold">
                      Apresentação do Tutor
                    </div>

                    {/* Math Blackboard / Screen Share content */}
                    <div className="text-center space-y-6 max-w-xl z-10 select-none">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="p-8 bg-[#0a0710]/80 border border-white/10 rounded-[2rem] shadow-2xl space-y-4"
                      >
                        <h4 className="text-orange font-extrabold text-sm uppercase tracking-widest">Quadro Virtual de Estudos</h4>
                        <div className="text-xl md:text-3xl font-black text-white font-mono leading-relaxed select-text">
                          {"\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1"}
                        </div>
                        <p className="text-xs md:text-sm text-white/50 font-medium">
                          Demonstração prática de limites notáveis aplicados aos exames de admissão angolanos (UAN, ISUTIC).
                        </p>
                      </motion.div>
                      <div className="inline-flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
                        <button className="px-4 py-2 bg-orange text-lilac-dark rounded-xl text-xs font-bold hover:bg-orange/80 transition-all">Próximo Slide</button>
                        <button className="px-4 py-2 text-white/60 hover:text-white rounded-xl text-xs font-bold transition-all">Limpar Notas</button>
                      </div>
                    </div>

                    {/* Background decor graph grid */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                  </div>

                  {/* Speaker Label */}
                  <div className="h-14 px-6 bg-lilac-dark/80 border-t border-white/5 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange to-amber-500 flex items-center justify-center text-white text-xs font-black shadow-md">
                        PK
                      </div>
                      <span className="font-bold text-sm text-white">Prof. Alberto Kiala (Apresentador)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-orange font-bold">
                      <Mic className="w-3.5 h-3.5 animate-pulse" />
                      <span>Explicando matéria...</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Video Grid (Tutor & Participants) */}
                <div className="w-full xl:w-80 flex flex-row xl:flex-col gap-4 overflow-x-auto xl:overflow-y-auto max-h-[160px] xl:max-h-none xl:h-full select-none">
                  
                  {/* Local camera preview */}
                  <div className={`shrink-0 w-44 xl:w-full aspect-video rounded-3xl overflow-hidden border relative bg-lilac-dark/40 ${camOn ? 'border-orange/40 shadow-[0_0_15px_rgba(255,107,0,0.1)]' : 'border-white/5'}`}>
                    {camOn ? (
                      <div className="w-full h-full bg-gradient-to-tr from-[#1b122c] to-[#2d1e49] flex flex-col items-center justify-center relative">
                        <div className="w-10 h-10 rounded-full bg-orange/10 border border-orange/30 flex items-center justify-center text-orange font-black mb-1">
                          {user?.full_name?.substring(0, 2).toUpperCase() || "EU"}
                        </div>
                        <span className="text-[10px] text-white/70 font-semibold">Minha Câmara</span>
                        {/* Audio wave simulation */}
                        {micOn && (
                          <div className="absolute bottom-12 flex gap-0.5 justify-center items-end h-4">
                            <span className="w-0.5 bg-orange animate-[bounce_0.6s_infinite_100ms] h-3"></span>
                            <span className="w-0.5 bg-orange animate-[bounce_0.6s_infinite_300ms] h-4"></span>
                            <span className="w-0.5 bg-orange animate-[bounce_0.6s_infinite_200ms] h-2"></span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/40">
                        <VideoOff className="w-6 h-6 text-white/30" />
                        <span className="text-[9px] text-white/40 font-bold mt-1.5">Câmara Desativada</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 text-[9px] font-bold flex items-center gap-1.5">
                      <span className="text-white truncate max-w-[80px]">Eu</span>
                      {micOn ? <Mic className="w-2.5 h-2.5 text-orange" /> : <MicOff className="w-2.5 h-2.5 text-rose-500" />}
                    </div>
                  </div>

                  {/* Remote speakers */}
                  {SIMULATED_PARTICIPANTS.map((part) => (
                    <div 
                      key={part.id} 
                      className={`shrink-0 w-44 xl:w-full aspect-video rounded-3xl overflow-hidden border relative bg-lilac-dark/40 transition-all duration-300 ${part.speaking ? 'border-orange ring-2 ring-orange/10 scale-[0.99] shadow-lg' : 'border-white/5'}`}
                    >
                      {part.hasCam ? (
                        <div className={`w-full h-full bg-gradient-to-tr ${part.color} opacity-80 flex flex-col items-center justify-center relative`}>
                          <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xs">
                            {part.avatar}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-lilac-dark/60">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${part.color} flex items-center justify-center text-white font-bold text-xs`}>
                            {part.avatar}
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 text-[9px] font-bold flex items-center gap-1.5">
                        <span className="text-white truncate max-w-[80px]">{part.name}</span>
                        {part.speaking ? <Mic className="w-2.5 h-2.5 text-orange animate-pulse" /> : <MicOff className="w-2.5 h-2.5 text-white/30" />}
                      </div>
                    </div>
                  ))}

                </div>

              </div>
            ) : (
              /* GRID LAYOUT: Simple collaborative grid */
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
                
                {/* Local user */}
                <div className={`aspect-video rounded-3xl overflow-hidden border relative bg-lilac-dark/40 flex items-center justify-center ${camOn ? 'border-orange' : 'border-white/5'}`}>
                  {camOn ? (
                    <div className="w-full h-full bg-gradient-to-tr from-[#1b122c] to-[#2d1e49] flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-orange text-lilac-dark flex items-center justify-center font-black text-sm mb-1.5 shadow-[0_0_12px_rgba(255,107,0,0.3)]">
                        {user?.full_name?.substring(0, 2).toUpperCase() || "EU"}
                      </div>
                      <span className="text-xs text-white/60 font-semibold">Minha Câmara</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/30">
                      <VideoOff className="w-8 h-8" />
                      <span className="text-xs font-bold mt-2">Câmara Desativada</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/60 text-xs font-bold flex items-center gap-2">
                    <span>Eu</span>
                    {micOn ? <Mic className="w-3 h-3 text-orange" /> : <MicOff className="w-3 h-3 text-rose-500" />}
                  </div>
                </div>

                {/* Other participant profiles in grid */}
                {SIMULATED_PARTICIPANTS.map((part) => (
                  <div 
                    key={part.id}
                    className={`aspect-video rounded-3xl overflow-hidden border relative bg-lilac-dark/40 flex items-center justify-center ${part.speaking ? 'border-orange ring-4 ring-orange/10' : 'border-white/5'}`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${part.color} flex items-center justify-center font-bold text-white text-sm mb-2 shadow-inner border border-white/10`}>
                        {part.avatar}
                      </div>
                      <span className="text-xs text-white/60 font-semibold">{part.name}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/60 text-xs font-bold flex items-center gap-2">
                      <span className="truncate max-w-[100px]">{part.name}</span>
                      {part.speaking ? <Mic className="w-3 h-3 text-orange animate-pulse" /> : <MicOff className="w-3 h-3 text-white/30" />}
                    </div>
                  </div>
                ))}

              </div>
            )}
          </AnimatePresence>

        </div>

        {/* Live Chat Sidebar */}
        <AnimatePresence>
          {chatOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="shrink-0 h-full border-l border-white/5 bg-[#100b1a]/95 backdrop-blur-xl flex flex-col z-10"
            >
              {/* Sidebar Header */}
              <div className="h-16 px-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange" />
                  <h3 className="font-bold text-sm text-white font-title">Chat de Estudo</h3>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 hover:bg-white/5 rounded-xl transition text-white/50 hover:text-white"
                >
                  <span className="text-xs font-bold">Ocultar</span>
                </button>
              </div>

              {/* Chat messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
                {chatMessages.map((msg, index) => {
                  const isSystem = msg.sender === "System";
                  return (
                    <div key={index} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                      {!isSystem && (
                        <span className={`text-[10px] font-bold ${msg.role === 'teacher' ? 'text-orange' : 'text-white/40'} mb-1`}>
                          {msg.sender} {msg.role === 'teacher' && "• Tutor"}
                        </span>
                      )}
                      <div className={`p-3 rounded-2xl text-xs max-w-[85%] font-medium leading-relaxed ${
                        isSystem 
                          ? 'bg-lilac-base/5 border border-lilac-light/10 text-white/60 italic text-center w-full'
                          : msg.isSelf
                            ? 'bg-orange text-lilac-dark rounded-tr-none'
                            : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input section */}
              <form onSubmit={handleSendChat} className="p-4 border-t border-white/5 flex gap-2 items-center bg-lilac-dark/10 shrink-0">
                <input 
                  type="text" 
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Escreve para a sala..."
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl focus:border-orange focus:bg-white/10 outline-none text-xs text-white placeholder:text-white/30 font-medium"
                />
                <button 
                  type="submit" 
                  disabled={!newMsg.trim()}
                  className="bg-orange hover:bg-orange/80 p-2.5 rounded-xl text-lilac-dark transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 text-lilac-dark" />
                </button>
              </form>
            </motion.aside>
          )}
        </AnimatePresence>

      </div>

      {/* Footer / Call Control Toolbar */}
      <footer className="h-20 bg-lilac-dark/60 border-t border-white/5 backdrop-blur-xl shrink-0 flex items-center justify-between px-6 z-20">
        
        {/* Left Options (Layout toggle, sound toggle) */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveLayout(prev => prev === 'focus' ? 'grid' : 'focus')}
            className={`p-3 rounded-2xl transition border text-white ${
              activeLayout === 'grid' 
                ? 'bg-orange/15 border-orange/40 text-orange' 
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
            title="Alternar Layout"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSoundOn(!soundOn)}
            className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/80 transition"
            title={soundOn ? "Silenciar Áudio" : "Ativar Áudio"}
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-500" />}
          </button>
        </div>

        {/* Center Live controls (Cam, Mic, ScreenShare, Hand) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMicOn(!micOn)}
            className={`p-3.5 rounded-2xl border transition-all ${
              micOn 
                ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' 
                : 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20'
            }`}
            title={micOn ? "Mutar Microfone" : "Ativar Microfone"}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setCamOn(!camOn)}
            className={`p-3.5 rounded-2xl border transition-all ${
              camOn 
                ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' 
                : 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20'
            }`}
            title={camOn ? "Desligar Câmara" : "Ligar Câmara"}
          >
            {camOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setScreenSharing(!screenSharing)}
            className={`p-3.5 rounded-2xl border transition-all ${
              screenSharing 
                ? 'bg-orange border-orange text-lilac-dark font-bold' 
                : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80'
            }`}
            title={screenSharing ? "Parar Partilha" : "Partilhar Ecrã"}
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setRaisedHand(!raisedHand)}
            className={`p-3.5 rounded-2xl border transition-all ${
              raisedHand 
                ? 'bg-orange border-orange text-lilac-dark' 
                : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80'
            }`}
            title="Levantar a mão"
          >
            <Hand className="w-5 h-5" />
          </button>
        </div>

        {/* Right controls (Chat toggle, leave room) */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-3 rounded-2xl transition border text-white ${
              chatOpen 
                ? 'bg-orange/15 border-orange/40 text-orange' 
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
            title="Mostrar Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button 
            onClick={handleLeave}
            className="px-6 py-3 bg-rose-500 hover:bg-rose-600 border border-rose-500/30 text-white font-bold text-sm rounded-2xl transition flex items-center gap-2 shadow-lg shadow-rose-500/10"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Desligar</span>
          </button>
        </div>

      </footer>

    </div>
  );
}
