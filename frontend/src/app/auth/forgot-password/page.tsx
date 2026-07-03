"use client";
import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccess(false);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Erro ao solicitar recuperação. Tenta novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans z-10">
      
      {/* Background radial highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lilac-light/20 rounded-full filter blur-[150px] pointer-events-none -z-10 hidden md:block"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange/10 rounded-full filter blur-[150px] pointer-events-none -z-10 hidden md:block"></div>

      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-white/50 hover:text-orange font-bold text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Login
        </Link>
        
        <div className="card-lilac-glass border-lilac-light/40 bg-lilac-base/20 p-8 shadow-2xl relative z-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white font-title mb-3">Recuperar Senha</h1>
            <p className="text-white/60 font-medium text-sm leading-relaxed">
              Insere o teu e-mail associado à conta e enviar-te-emos as instruções para redefinir a tua senha.
            </p>
          </div>

          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Email Enviado!</h3>
              <p className="text-white/60 text-sm">
                Se o email <strong>{email}</strong> estiver registado, receberás um link de recuperação em breve.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-6 text-sm text-orange font-bold hover:underline"
              >
                Tentar outro email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 text-sm text-rose-400 bg-rose-950/40 rounded-xl border border-rose-800/40 font-bold">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 ml-1 uppercase tracking-wider">E-mail de Registo</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/35 group-focus-within:text-orange transition-colors" />
                  <input 
                    type="email" 
                    required
                    placeholder="exemplo@aprovei.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all font-medium text-white placeholder:text-white/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange text-lilac-dark py-3.5 rounded-xl font-black text-lg hover:bg-orange/90 transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(255,107,0,0.25)] flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-lilac-dark/20 border-t-lilac-dark rounded-full animate-spin"></div>
                ) : (
                  "Enviar Link de Recuperação"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
