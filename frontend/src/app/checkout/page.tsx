"use client";
import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, CheckCircle2, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'express' | 'transfer'>('express');
  const [showExpressModal, setShowExpressModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'waiting' | 'success'>('idle');
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const packagePrice = 15000;

  const handleExpressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const res = await api.post('/payments/initiate', {
        item_type: 'premium_subscription'
      });
      setTransaction(res.data);
      setPaymentStatus('waiting');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || "Erro ao iniciar o pagamento. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  const simulatePaymentApproval = async () => {
    if (!transaction) return;
    setLoading(true);
    
    try {
      // Chama o webhook real do backend para comprovar o pagamento
      await api.post('/payments/webhook', {
        gateway_transaction_id: transaction.gateway_transaction_id,
        status: 'completed'
      });
      
      // Atualiza o utilizador local para premium
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        userObj.is_premium = true;
        localStorage.setItem('user', JSON.stringify(userObj));
      }
      
      setPaymentStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erro ao processar a confirmação simulada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-12 px-4 md:px-6 relative z-10">
      
      {/* Background radial highlights */}
      <div className="absolute top-[10%] right-[-20%] w-[500px] h-[500px] bg-lilac-light/10 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-20%] w-[500px] h-[500px] bg-orange/5 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>

      <a href="/" className="inline-flex items-center gap-2 text-white/60 font-bold hover:text-orange transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </a>
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-white font-title">Finalizar Assinatura</h1>
        <p className="text-white/70 font-medium">Estás a um passo de garantir a tua aprovação.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Package Summary */}
        <div className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg p-8">
          <h3 className="text-xl font-black text-white mb-6 font-title">Resumo do Pedido</h3>
          <div className="flex justify-between items-center pb-6 border-b border-white/10">
            <div>
              <p className="font-bold text-white">Pacote Pro (Anual)</p>
              <p className="text-sm text-white/50 font-medium">Acesso a todos exames e fórum VIP</p>
            </div>
            <p className="font-bold text-white">{packagePrice.toLocaleString()} Kz</p>
          </div>
          <div className="flex justify-between items-center pt-6">
            <p className="font-black text-white text-lg">Total a pagar</p>
            <p className="font-black text-orange-glow text-2xl">{packagePrice.toLocaleString()} Kz</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg p-8 space-y-8">
          <h3 className="text-xl font-black text-white font-title">Método de Pagamento</h3>
          
          <div className="space-y-4">
            <button 
              onClick={() => setPaymentMethod('express')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'express' ? 'border-orange bg-orange/10 shadow-[0_0_15px_rgba(255,107,0,0.15)]' : 'border-lilac-light/20 bg-lilac-dark/40 hover:border-orange/30'}`}
            >
              <div className="w-12 h-12 bg-orange rounded-lg flex items-center justify-center text-lilac-dark">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-white">Multicaixa Express</p>
                <p className="text-xs text-white/50 font-medium">Pagamento imediato via telemóvel</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'express' ? 'border-orange' : 'border-white/30'}`}>
                {paymentMethod === 'express' && <div className="w-2.5 h-2.5 rounded-full bg-orange"></div>}
              </div>
            </button>

            <button 
              onClick={() => setPaymentMethod('transfer')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'transfer' ? 'border-orange bg-orange/10 shadow-[0_0_15px_rgba(255,107,0,0.15)]' : 'border-lilac-light/20 bg-lilac-dark/40 hover:border-orange/30'}`}
            >
              <div className="w-12 h-12 bg-lilac-dark border border-lilac-light/30 rounded-lg flex items-center justify-center text-white">
                <CreditCard className="w-6 h-6 text-orange" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-white">Transferência Bancária</p>
                <p className="text-xs text-white/50 font-medium">Envio de comprovativo manual</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'transfer' ? 'border-orange' : 'border-white/30'}`}>
                {paymentMethod === 'transfer' && <div className="w-2.5 h-2.5 rounded-full bg-orange"></div>}
              </div>
            </button>
          </div>

          <button 
            onClick={() => paymentMethod === 'express' ? setShowExpressModal(true) : alert('Neste ambiente de teste, foca-te no Multicaixa Express!')}
            className="w-full bg-orange text-lilac-dark py-4 rounded-xl font-bold text-lg hover:bg-orange/90 transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(255,107,0,0.35)]"
          >
            Avançar para Pagamento
          </button>
        </div>
      </div>

      {/* Multicaixa Express Modal */}
      <AnimatePresence>
        {showExpressModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-lilac-dark/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card-lilac-glass border-lilac-light/40 bg-lilac-base/95 w-full max-w-md p-8 shadow-2xl relative z-20"
            >
              {paymentStatus === 'idle' && (
                <>
                  <button onClick={() => setShowExpressModal(false)} className="absolute top-6 right-6 text-white/40 hover:text-orange font-bold text-sm">X</button>
                  <div className="text-center space-y-4 mb-8">
                    <div className="w-16 h-16 bg-orange/10 border border-orange/20 text-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white font-title">Pagamento Express</h3>
                    <p className="text-white/60 font-medium text-sm leading-relaxed">
                      Insira o número de telemóvel associado ao seu Multicaixa Express. Receberá uma notificação para aprovar o pagamento de <span className="font-bold text-white">{packagePrice.toLocaleString()} Kz</span>.
                    </p>
                  </div>
                  
                  <form onSubmit={handleExpressSubmit} className="space-y-6">
                    {errorMsg && (
                      <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-xl border border-rose-800/40 font-bold">
                        {errorMsg}
                      </div>
                    )}
                    <div className="text-left">
                      <label className="text-xs font-bold text-white/70 ml-1 uppercase tracking-wider">Número de Telemóvel</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="Ex: 923 000 000"
                        className="w-full mt-2 px-4 py-4 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all font-bold text-white text-center text-xl tracking-widest placeholder:text-white/25"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-orange hover:bg-orange/80 text-lilac-dark py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-orange/30 flex items-center justify-center gap-2">
                      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>{loading ? 'Processando...' : 'Enviar Pedido'}</span>
                    </button>
                  </form>
                </>
              )}

              {paymentStatus === 'waiting' && (
                <div className="text-center space-y-6 py-8">
                  <Loader2 className="w-16 h-16 text-orange animate-spin mx-auto" />
                  <h3 className="text-2xl font-black text-white font-title">Aguardando Aprovação</h3>
                  <p className="text-white/60 font-medium leading-relaxed">
                    A transação foi iniciada. Por favor, verifique o seu telemóvel e aprove o pagamento no aplicativo Multicaixa Express.
                  </p>
                  
                  {transaction && (
                    <div className="bg-lilac-dark/40 p-4 rounded-2xl border border-white/5 space-y-2 text-sm text-left">
                      <p className="text-white/50"><strong>Referência:</strong> <span className="text-white font-bold tracking-wider">{transaction.payment_reference}</span></p>
                      <p className="text-white/50"><strong>Entidade:</strong> <span className="text-white font-bold">{transaction.payment_entity}</span></p>
                      <p className="text-white/50"><strong>Valor:</strong> <span className="text-orange font-black">{transaction.amount.toLocaleString()} Kz</span></p>
                    </div>
                  )}

                  <button 
                    onClick={simulatePaymentApproval}
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-400 text-lilac-dark py-3.5 rounded-xl font-bold transition-all shadow-md mt-6 flex items-center justify-center gap-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>Confirmar Pagamento (Simulado)</span>
                  </button>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 bg-orange/10 border border-orange/20 text-orange rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(255,107,0,0.25)]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-white font-title">Pagamento Concluído!</h3>
                  <p className="text-white/60 font-medium leading-relaxed">O seu pacote foi ativado com sucesso. Bem-vindo ao acesso VIP da APROVEI.</p>
                  <a href="/dashboard" className="block w-full bg-orange hover:bg-orange/80 text-lilac-dark py-4 rounded-xl font-bold text-lg transition-all mt-8 shadow-lg shadow-orange/20 text-center">
                    Aceder à Plataforma
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
