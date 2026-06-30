"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, AlertCircle, RefreshCw, BookOpen, GraduationCap, Plus, MessageSquare, LogIn, ArrowLeft } from "lucide-react";
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
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  
  // Challenge State variables
  const [examKeyInput, setExamKeyInput] = useState("");
  const [startingChallenge, setStartingChallenge] = useState(false);
  const [challengeError, setChallengeError] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      setMobileView('chat');
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
      setMobileView('chat');
    } catch (err) {
      console.error("Erro ao criar sessão", err);
    }
  };

  const handleSelectSession = (id: number) => {
    setActiveSessionId(id);
    fetchMessages(id);
    setMobileView('chat');
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

  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      let cleanLine = line;
      const isListItem = cleanLine.trim().startsWith('- ') || cleanLine.trim().startsWith('* ');
      if (isListItem) {
        cleanLine = cleanLine.replace(/^[\s\-\*]+/, '');
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-orange font-black">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      const renderedLine = parts.length > 0 ? parts : cleanLine;

      if (isListItem) {
        return (
          <div key={i} className="flex gap-2 items-start font-medium text-white/95 mt-1 ml-2">
            <span className="text-orange shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-orange"></span>
            <span>{renderedLine}</span>
          </div>
        );
      }

      return (
        <p key={i} className="min-h-[1.2rem] font-medium text-white/90 leading-relaxed text-left">
          {renderedLine}
        </p>
      );
    });
  };

  return (
    <div className={
      isAuthenticated 
        ? "w-full flex-grow flex flex-col max-w-[1600px] mx-auto font-sans relative overflow-hidden"
        : "min-h-screen bg-background pt-24 pb-12 flex flex-col px-6 md:px-12 lg:px-20 xl:px-32 max-w-[1600px] mx-auto font-sans relative overflow-hidden"
    }>
      
      {/* Background Orbs */}
      {!isAuthenticated && (
        <>
          <div className="absolute top-[10%] left-[-5%] w-[400px] h-[400px] bg-lilac-light/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-orange/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        </>
      )}

      {isAuthenticated ? (
        <div className="w-full flex-grow flex flex-col overflow-hidden relative">
          {isMobile ? (
            /* ==========================================
                MOBILE VIEW (100% WhatsApp Replica Layout)
                ========================================== */
            <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-[#0a050d] relative z-10 overflow-hidden">
              {mobileView === 'list' ? (
                /* SCREEN 1: CHATS LIST (WhatsApp tab-like style) */
                <div className="flex flex-col h-full w-full relative">
                  {/* WhatsApp Header */}
                  <div className="bg-[#1c1422] border-b border-lilac-light/10 px-5 py-4 flex items-center justify-between shadow-md">
                    <span className="font-black text-lg text-white font-title flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange animate-pulse" />
                      APROVEI IA
                    </span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleCreateSession()} 
                        className="p-2 bg-white/5 border border-white/10 rounded-full text-white hover:text-orange transition-colors"
                        title="Nova Conversa"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => fetchSessions()} 
                        className="p-2 bg-white/5 border border-white/10 rounded-full text-white hover:text-orange transition-colors"
                        title="Recarregar"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search/Challenge key input */}
                  <div className="px-4 py-3 bg-[#130a18] border-b border-lilac-light/10">
                    <div className="flex gap-2 bg-[#1c1422] border border-lilac-light/20 rounded-full px-4 py-2 items-center">
                      <BookOpen className="w-4 h-4 text-white/40 shrink-0" />
                      <input
                        type="text"
                        value={examKeyInput}
                        onChange={(e) => setExamKeyInput(e.target.value)}
                        placeholder="Chave do Simulado... (Ex: UAN-MAT-2023)"
                        className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none font-bold uppercase"
                      />
                      <button
                        onClick={() => handleStartExamChallenge(examKeyInput)}
                        disabled={!examKeyInput.trim() || startingChallenge}
                        className="text-xs font-black text-orange hover:text-orange/80 disabled:opacity-30"
                      >
                        {startingChallenge ? '...' : 'Iniciar'}
                      </button>
                    </div>
                    {challengeError && (
                      <p className="text-[10px] text-rose-400 mt-1.5 px-2 font-semibold text-left">{challengeError}</p>
                    )}
                  </div>

                  {/* Scrollable list of active tutor chat sessions */}
                  <div className="flex-grow overflow-y-auto divide-y divide-white/5 bg-[#0a050d]">
                    {loadingSessions ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-2">
                        <div className="w-8 h-8 border-2 border-orange/20 border-t-orange rounded-full animate-spin"></div>
                        <span className="text-xs text-white/50 font-bold">A carregar conversas...</span>
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-center py-20 text-white/40 font-medium text-sm px-6">
                        Nenhuma conversa ativa. Prime no botão "+" abaixo para iniciar uma tutoria de estudos!
                      </div>
                    ) : (
                      sessions.map((session) => {
                        const isChallengeSession = session.title.startsWith("Desafio:");
                        return (
                          <button
                            key={session.id}
                            onClick={() => handleSelectSession(session.id)}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left"
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                              isChallengeSession 
                                ? 'bg-orange/10 border border-orange/20 text-orange' 
                                : 'bg-lilac-base/20 border border-lilac-light/20 text-white'
                            }`}>
                              {isChallengeSession ? <GraduationCap className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-[14px] text-white truncate">{session.title}</h4>
                                <span className="text-[10px] text-white/40 font-medium shrink-0 ml-2">Hoje</span>
                              </div>
                              <p className="text-xs text-white/50 truncate font-semibold">
                                {isChallengeSession 
                                  ? "Simulado ativo. Toca para continuar a responder." 
                                  : "Olá! Sou a APROVEI IA. Como te posso ajudar nos estudos?"}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Floating Action Button (FAB) */}
                  <button
                    onClick={() => handleCreateSession()}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-orange hover:bg-orange/95 text-lilac-dark rounded-full shadow-[0_4px_16px_rgba(255,107,0,0.4)] flex items-center justify-center cursor-pointer active:scale-95 transition-transform z-20"
                    title="Nova Conversa"
                  >
                    <Plus className="w-6 h-6 text-lilac-dark font-black" />
                  </button>
                </div>
              ) : (
                /* SCREEN 2: ACTIVE CONVERSATION SCREEN */
                <div className="flex flex-col h-full w-full relative bg-[#09040c]">
                  {/* WhatsApp Style Top header */}
                  <div className="bg-[#1c1422] border-b border-lilac-light/10 px-3 py-3 flex items-center justify-between shadow-md shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <button 
                        onClick={() => {
                          setMobileView('list');
                          setActiveSessionId(null);
                        }}
                        className="p-1.5 text-white/70 hover:text-white transition-colors shrink-0"
                      >
                        <ArrowLeft className="w-6 h-6" />
                      </button>
                      <div className="w-10 h-10 bg-orange/10 border border-orange/20 rounded-full flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-orange" />
                      </div>
                      <div className="text-left min-w-0">
                        <h4 className="font-bold text-[14px] text-white truncate pr-2">
                          {isChallenge ? activeSession?.title : "Tutor Inteligente"}
                        </h4>
                        <span className="text-[10px] text-green-400 font-bold block leading-none">online</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => activeSessionId && fetchMessages(activeSessionId)}
                      className="p-2 bg-white/5 border border-white/10 rounded-full text-white hover:text-orange transition-colors shrink-0"
                      title="Recarregar"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Message History area */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-grow overflow-y-auto p-4 space-y-3 bg-[#0a050d] custom-scrollbar"
                    style={{
                      backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.015) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.015) 2%, transparent 0%)",
                      backgroundSize: "100px 100px"
                    }}
                  >
                    {messages.map((msg) => {
                      const isUser = msg.sender === "user";
                      return (
                        <div
                          key={msg.id}
                          className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] px-3.5 py-2.5 shadow-md ${
                            isUser 
                              ? 'bg-orange text-lilac-dark rounded-[18px] rounded-tr-none text-left' 
                              : 'bg-[#1c1422] border border-lilac-light/10 text-white rounded-[18px] rounded-tl-none text-left'
                          }`}>
                            {isUser ? (
                              <p className="whitespace-pre-wrap text-sm font-semibold">{msg.content}</p>
                            ) : (
                              <div className="space-y-1.5 text-sm font-semibold leading-relaxed">
                                {renderMessageContent(msg.content)}
                              </div>
                            )}
                            <div className="text-[9px] text-right mt-1.5 opacity-55 font-bold leading-none select-none">
                              Hoje ✓✓
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[#1c1422] border border-lilac-light/10 px-4 py-3 rounded-[18px] rounded-tl-none flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-orange/70 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-orange/70 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-orange/70 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <div className="p-3 bg-[#130a18] border-t border-lilac-light/10 shrink-0">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                      <div className="flex-1 bg-[#1c1422] border border-lilac-light/20 rounded-full px-5 py-3 flex items-center shadow-inner">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Mensagem..."
                          className="w-full bg-transparent focus:outline-none text-sm text-white placeholder-white/40 font-medium"
                          disabled={isTyping || activeSessionId === null}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!input.trim() || isTyping || activeSessionId === null}
                        className="w-12 h-12 bg-orange text-lilac-dark rounded-full flex items-center justify-center shrink-0 shadow-lg active:scale-90 transition-transform disabled:opacity-40 disabled:scale-100"
                      >
                        <Send className="w-5 h-5 text-lilac-dark ml-0.5" />
                      </button>
                    </form>
                    <p className="text-[9px] text-white/30 text-center mt-2 font-semibold">
                      O tutor foca-se no currículo oficial. Valida sempre os resultados.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ==========================================
                1. DESKTOP VIEW (Premium 2-Column Grid Layout)
                ========================================== */
            <div className="grid grid-cols-12 gap-6 lg:gap-8 h-[calc(100vh-14rem)] min-h-[450px] relative z-10 w-full px-4">
              {/* Left Sidebar */}
              <div className="col-span-4 flex flex-col gap-6 h-full overflow-hidden">
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

              {/* Desktop Chat Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="col-span-8 w-full card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg overflow-hidden flex flex-col h-full !p-0 rounded-[2rem] border border-white/10"
              >
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
                      onClick={() => activeSessionId && fetchMessages(activeSessionId)}
                      className="p-3 bg-lilac-dark/60 text-white/60 hover:text-orange border border-lilac-light/20 rounded-xl shadow-sm hover:shadow-md transition-all"
                      title="Recarregar mensagens"
                    >
                      <RefreshCw className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-8 space-y-6 bg-lilac-dark/25 custom-scrollbar"
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
                        {msg.sender === "user" ? (
                          <p className="whitespace-pre-wrap font-medium text-left">{msg.content}</p>
                        ) : (
                          <div className="space-y-1.5">{renderMessageContent(msg.content)}</div>
                        )}
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
          )}
        </div>
      ) : (
        /* GUEST USER / MARKETING SPLASH */
        <div className="flex-grow flex flex-col items-center justify-center text-center relative z-10 px-4 md:px-0">
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
      )}
    </div>
  );
}
