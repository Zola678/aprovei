"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, AlertCircle, RefreshCw, BookOpen, GraduationCap, Plus, MessageSquare, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModule } from "@/context/ModuleContext";
import Link from "next/link";


type Message = {
  id: number;
  session_id: number;
  sender: "user" | "ai";
  content: string;
};

type ChatSession = {
  id: number;
  title: string;
};

export default function AIChatPage() {
  const { activeModule } = useModule();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Challenge State variables
  const [examKeyInput, setExamKeyInput] = useState("");
  const [startingChallenge, setStartingChallenge] = useState(false);
  const [challengeError, setChallengeError] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoadingSessions(false);
    } else {
      setIsAuthenticated(true);
      fetchSessions();
    }
  }, []);

  // Check URL query parameters for 'challenge' parameter on load
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      const challengeKey = params.get("challenge");
      if (challengeKey) {
        handleStartExamChallenge(challengeKey);
        // Clean URL parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [isAuthenticated]);

  const handleStartExamChallenge = async (key: string) => {
    if (!key.trim()) return;
    setStartingChallenge(true);
    setChallengeError("");
    try {
      const res = await api.post("/ai/sessions/exam-challenge", { exam_key: key });
      setSessions(prev => [res.data, ...prev]);
      setActiveSessionId(res.data.id);
      await fetchMessages(res.data.id);
      setExamKeyInput("");
    } catch (err: any) {
      console.error("Erro ao iniciar desafio", err);
      setChallengeError(err.response?.data?.detail || "Não foi possível encontrar esta prova.");
    } finally {
      setStartingChallenge(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.get("/ai/sessions");
      setSessions(res.data);
      if (res.data.length > 0) {
        // Selecionar a sessão mais recente automaticamente
        setActiveSessionId(res.data[0].id);
        fetchMessages(res.data[0].id);
      } else {
        // Se não tiver sessões, cria uma inicial automaticamente
        await handleCreateSession("Estudos Gerais");
      }
    } catch (err) {
      console.error("Erro ao carregar sessões", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    try {
      const res = await api.get(`/ai/sessions/${sessionId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Erro ao carregar mensagens", err);
    }
  };

  const handleCreateSession = async (title = "Nova Conversa de Estudos") => {
    try {
      const res = await api.post("/ai/sessions", { title });
      setSessions(prev => [res.data, ...prev]);
      setActiveSessionId(res.data.id);
      setMessages([
        {
          id: Date.now(),
          session_id: res.data.id,
          sender: "ai",
          content: activeModule === "high_school" 
            ? "Olá! Sou a APROVEI IA, a tua explicadora para o Ensino Médio. Como te posso ajudar a dominar a matéria hoje?"
            : "Olá! Sou a APROVEI IA, o teu tutor focado nos Exames de Acesso Universitários. Qual é a disciplina que vamos estudar hoje?"
        }
      ]);
    } catch (err) {
      console.error("Erro ao criar sessão", err);
    }
  };

  const handleSelectSession = (id: number) => {
    setActiveSessionId(id);
    fetchMessages(id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || activeSessionId === null) return;

    const userText = input;
    setInput("");
    
    // Adicionar mensagem do utilizador localmente para resposta instantânea na tela
    const tempUserMsg: Message = {
      id: Date.now(),
      session_id: activeSessionId,
      sender: "user",
      content: userText
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const res = await api.post("/ai/messages", {
        session_id: activeSessionId,
        content: userText
      });
      // Substituir/adicionar a resposta real da IA obtida do backend
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Erro ao enviar mensagem", err);
      // Fallback em caso de erro de conexão
      const errMsg: Message = {
        id: Date.now() + 1,
        session_id: activeSessionId,
        sender: "ai",
        content: "Oops! Tive um problema de conexão com o meu servidor. Podes tentar novamente?"
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Se o utilizador não estiver autenticado, apresenta um banner premium convidativo
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center px-6 font-sans relative overflow-hidden">
        {/* Background radial highlights */}
        <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-lilac-light/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-orange/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full card-lilac-glass p-10 text-center border-orange/20 flex flex-col items-center space-y-8"
        >
          <div className="w-20 h-20 bg-orange/20 border border-orange/30 rounded-3xl flex items-center justify-center shadow-[0_0_20px_rgba(255,107,0,0.3)]">
            <Bot className="w-10 h-10 text-orange" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-white font-title leading-tight">
              Fala com a <span className="text-orange-glow">APROVEI IA</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed font-medium">
              Acede ao teu tutor particular 24 horas por dia, totalmente alinhado com o currículo de ensino de Angola.
            </p>
          </div>
          
          <div className="w-full pt-4 flex flex-col sm:flex-row gap-4">
            <Link href="/auth/login" className="btn-orange flex-1 py-4 text-lg flex items-center justify-center gap-2 font-bold shadow-[0_5px_20px_rgba(255,107,0,0.4)]">
              <LogIn className="w-5 h-5 text-lilac-dark" />
              <span className="text-lilac-dark font-black">Entrar na Conta</span>
            </Link>
            <Link href="/auth/register" className="flex-1 py-4 rounded-xl bg-lilac-base/40 text-white border border-lilac-light/40 hover:border-orange hover:text-orange font-bold shadow-sm transition-all text-center flex items-center justify-center">
              Criar Conta Grátis
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const isChallenge = activeSession?.title.startsWith("Desafio:");

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 flex flex-col px-6 md:px-12 lg:px-20 xl:px-32 max-w-[1600px] mx-auto font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-lilac-light/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-orange/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

      <div className="grid lg:grid-cols-12 gap-8 h-[78vh] relative z-10">
        
        {/* Left Sidebar (Chat Sessions) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-6 h-full overflow-hidden">
          {/* Header Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-lilac-base to-lilac-dark rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden flex-shrink-0 border border-lilac-light/20"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -mr-10 -mt-10"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-black font-title tracking-wide text-lg text-beam-effect">APROVEI IA</span>
            </div>
            <p className="text-white/85 text-sm font-medium leading-relaxed">
              Tutor inteligente adaptado às metas do {activeModule === "high_school" ? "Ensino Médio 🎒" : "Acesso Superior 🎓"}.
            </p>
          </motion.div>

          {/* Sessions List */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg flex-grow flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-black text-white font-title">Minhas Conversas</h3>
              <button 
                onClick={() => handleCreateSession()}
                className="p-2.5 bg-orange/10 hover:bg-orange/20 text-orange border border-orange/30 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm"
                title="Nova Conversa"
              >
                <Plus className="w-4 h-4" />
                <span>Nova</span>
              </button>
            </div>

            {/* Widget Desafio por Chave */}
            <div className="mb-4 p-4 rounded-2xl bg-lilac-dark/45 border border-lilac-light/10 flex-shrink-0 text-left">
              <span className="text-[10px] font-bold text-orange uppercase tracking-wider block mb-2">Desafio por Chave de Prova</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={examKeyInput}
                  onChange={(e) => setExamKeyInput(e.target.value)}
                  placeholder="Ex: UAN-MAT-2023"
                  className="flex-1 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange font-bold uppercase"
                />
                <button
                  onClick={() => handleStartExamChallenge(examKeyInput)}
                  disabled={!examKeyInput.trim() || startingChallenge}
                  className="px-3 py-2 bg-orange text-lilac-dark font-black text-xs rounded-xl hover:bg-orange/80 transition-colors disabled:opacity-50"
                >
                  {startingChallenge ? '...' : 'Iniciar'}
                </button>
              </div>
              {challengeError && (
                <p className="text-[10px] text-rose-400 mt-2 font-bold leading-tight">{challengeError}</p>
              )}
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {loadingSessions ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <div className="w-6 h-6 border-2 border-orange/20 border-t-orange rounded-full animate-spin"></div>
                  <span className="text-xs text-white/60 font-bold">A carregar...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-10 text-white/50 font-medium text-sm">Nenhuma conversa activa.</div>
              ) : (
                sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center gap-3 transition-all group ${
                      activeSessionId === session.id 
                        ? "border-orange bg-orange/10 text-orange" 
                        : "border-lilac-light/20 bg-lilac-dark/40 hover:border-orange/50 text-white/70 hover:text-white"
                    }`}
                  >
                    <MessageSquare className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${activeSessionId === session.id ? "text-orange" : "text-white/45 group-hover:text-white/75"}`} />
                    <span className="font-bold text-sm truncate">{session.title}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Chat Area */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-8 w-full card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg overflow-hidden flex flex-col h-full !p-0"
        >
          {/* Header */}
          <div className="bg-lilac-dark/40 border-b border-lilac-light/20 p-5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange/10 border border-orange/20 rounded-xl flex items-center justify-center shadow-sm">
                <Bot className="w-6 h-6 text-orange" />
              </div>
              <div className="text-left">
                <h1 className="text-base font-black text-white flex items-center gap-2 font-title">
                  {isChallenge ? activeSession?.title : "Tutor Inteligente"}
                </h1>
                <div className="flex items-center gap-1.5">
                  {isChallenge ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-orange text-lilac-dark text-[10px] font-black uppercase tracking-wider animate-pulse">
                      Desafio Ativo 🎯
                    </span>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <p className="text-xs font-bold text-white/60">
                        {activeModule === "high_school" ? "Contexto: Ensino Médio 🎒" : "Contexto: Acesso Superior 🎓"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-3 bg-lilac-dark/60 text-white/60 hover:text-orange border border-lilac-light/20 rounded-xl shadow-sm hover:shadow-md transition-all animate-pulse"
                title="Minhas Conversas"
              >
                <MessageSquare className="w-4.5 h-4.5 text-orange" />
              </button>
              <button 
                onClick={() => activeSessionId && fetchMessages(activeSessionId)}
                className="p-3 bg-lilac-dark/60 text-white/60 hover:text-orange border border-lilac-light/20 rounded-xl shadow-sm hover:shadow-md transition-all"
                title="Recarregar mensagens"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-lilac-dark/25 custom-scrollbar"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${msg.sender === "user" ? "bg-orange text-lilac-dark" : "bg-gradient-to-br from-lilac-light to-lilac-base text-white border border-lilac-light/30"}`}>
                  {msg.sender === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl text-[14px] leading-relaxed font-semibold ${msg.sender === "user" ? "bg-gradient-to-r from-orange to-amber-500 text-lilac-dark rounded-tr-sm shadow-[0_5px_15px_rgba(255,107,0,0.2)]" : "bg-lilac-dark/60 border border-lilac-light/30 text-white rounded-tl-sm shadow-sm"}`}>
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 max-w-[85%] mr-auto"
              >
                <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-lilac-light to-lilac-base text-white border border-lilac-light/30 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-lilac-dark/60 border border-lilac-light/30 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-orange/70 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-orange/70 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-orange/70 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 bg-lilac-dark/40 border-t border-lilac-light/20 flex-shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeModule === "high_school" 
                  ? "Pergunta sobre Matemática, Física, ITEL, 10ª classe..."
                  : "Pergunta sobre exames UAN, ISUTIC, limites notáveis, mecânica..."
                }
                className="w-full pl-5 pr-14 py-4 bg-lilac-dark/60 border border-lilac-light/20 rounded-2xl focus:outline-none focus:border-orange/55 focus:ring-4 focus:ring-orange/15 text-sm font-semibold text-white placeholder-white/40 transition-all shadow-inner"
                disabled={isTyping || activeSessionId === null}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping || activeSessionId === null}
                className="absolute right-2.5 p-2.5 bg-orange text-lilac-dark rounded-xl hover:bg-orange/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-4.5 h-4.5 ml-0.5 text-lilac-dark" />
              </button>
            </form>
            <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold text-white/50">
              <AlertCircle className="w-3.5 h-3.5 text-orange" />
              <span>O tutor foca-se no currículo oficial. Valida sempre os resultados.</span>
            </div>
          </div>
          
        </motion.div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSidebar(false)}
              className="fixed inset-0 bg-[#0f0b12]/80 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85vw] bg-[#1c1422] border-r border-lilac-light/20 p-6 flex flex-col h-full z-10 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <span className="font-black font-title tracking-wide text-lg text-white">Minhas Conversas</span>
                <button 
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 text-white/60 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <button 
                onClick={() => {
                  handleCreateSession();
                  setShowMobileSidebar(false);
                }}
                className="w-full mb-4 py-3 bg-orange text-lilac-dark rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold text-sm shadow-sm"
              >
                <Plus className="w-4 h-4 text-lilac-dark" />
                <span className="text-lilac-dark font-black">Nova Conversa</span>
              </button>

              {/* Widget Desafio por Chave */}
              <div className="mb-4 p-4 rounded-2xl bg-lilac-base/10 border border-lilac-light/10 flex-shrink-0 text-left">
                <span className="text-[10px] font-bold text-orange uppercase tracking-wider block mb-2">Desafio por Chave</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={examKeyInput}
                    onChange={(e) => setExamKeyInput(e.target.value)}
                    placeholder="Ex: UAN-MAT-2023"
                    className="flex-1 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange font-bold uppercase"
                  />
                  <button
                    onClick={async () => {
                      await handleStartExamChallenge(examKeyInput);
                      setShowMobileSidebar(false);
                    }}
                    disabled={!examKeyInput.trim() || startingChallenge}
                    className="px-3 py-2 bg-orange text-lilac-dark font-black text-xs rounded-xl hover:bg-orange/80 transition-colors disabled:opacity-50"
                  >
                    {startingChallenge ? '...' : 'Ir'}
                  </button>
                </div>
                {challengeError && (
                  <p className="text-[10px] text-rose-400 mt-2 font-bold leading-tight">{challengeError}</p>
                )}
              </div>

              <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {loadingSessions ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <div className="w-6 h-6 border-2 border-orange/20 border-t-orange rounded-full animate-spin"></div>
                    <span className="text-xs text-white/60 font-bold">A carregar...</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-10 text-white/50 font-medium text-sm">Nenhuma conversa activa.</div>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        handleSelectSession(session.id);
                        setShowMobileSidebar(false);
                      }}
                      className="w-full text-left p-4 rounded-xl border border-lilac-light/20 bg-lilac-dark/40 hover:border-orange/50 text-white/70 hover:text-white flex items-center gap-3 transition-all group"
                    >
                      <MessageSquare className="w-5 h-5 shrink-0 text-white/45 group-hover:text-orange" />
                      <span className="font-bold text-sm truncate">{session.title}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
