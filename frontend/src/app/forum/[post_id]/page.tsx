"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Heart, 
  User, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Award,
  Video as VideoIcon,
  Calendar,
  Play,
  Users
} from 'lucide-react';

export default function PostDetailPage({ params }: { params: { post_id: string } }) {
  const postId = params.post_id;
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [token, setToken] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const res = await api.get(`/forum/${postId}`);
      setPost(res.data);
    } catch (err) {
      console.error("Erro ao obter detalhes da publicação", err);
      setErrorMsg("Discussão não encontrada ou erro de rede.");
    }
  };

  const handleLike = async () => {
    if (!token) {
      alert("Precisas de fazer login para curtir discussões.");
      return;
    }

    try {
      const res = await api.post(`/forum/${postId}/like`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPost({ ...post, likes: res.data.likes });
    } catch (err) {
      console.error("Erro ao curtir post", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) {
      alert("Precisas de estar logado para comentar.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/forum/${postId}/comments`, {
        post_id: parseInt(postId),
        content: newComment
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNewComment('');
      fetchPostDetails();
    } catch (err) {
      console.error("Erro ao publicar comentário", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCall = async (isConfirmed: boolean) => {
    if (!token) {
      alert("Precisas de fazer login para confirmar presença em chamadas.");
      return;
    }
    try {
      const endpoint = isConfirmed ? 'unconfirm-call' : 'confirm-call';
      const res = await api.post(`/forum/${postId}/${endpoint}`);
      setPost(res.data);
    } catch (err) {
      console.error("Erro ao confirmar presença na chamada:", err);
    }
  };

  const handleStartCall = async () => {
    if (!token) {
      alert("Precisas de fazer login para iniciar chamadas.");
      return;
    }
    try {
      const res = await api.post(`/forum/${postId}/start-call`);
      setPost(res.data);
      router.push(`/forum/stream/${postId}`);
    } catch (err) {
      console.error("Erro ao iniciar chamada:", err);
    }
  };

  if (errorMsg) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 text-center space-y-4 relative z-10">
        <p className="text-rose-500 font-bold text-lg">{errorMsg}</p>
        <button onClick={() => router.push('/forum')} className="text-orange font-bold hover:underline flex items-center gap-1 mx-auto transition-all">
          <ArrowLeft className="w-4 h-4" /> Voltar ao fórum
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-center text-white/60 font-medium relative z-10">
        <div className="space-y-3">
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Carregando discussão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 md:px-6 relative z-10">
      
      {/* Background decoration */}
      <div className="absolute top-[10%] right-[-20%] w-[500px] h-[500px] bg-lilac-light/10 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-20%] w-[500px] h-[500px] bg-orange/5 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>

      {/* Back button */}
      <button
        onClick={() => router.push('/forum')}
        className="text-white/60 hover:text-orange font-bold flex items-center gap-1.5 text-sm transition-colors mt-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Fórum</span>
      </button>

      {/* Main post block */}
      <div className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <span className="bg-orange/10 text-orange border border-orange/20 text-xs px-3 py-1 rounded-full font-bold">
            {post.category || "Dúvida"}
          </span>
          <span className="text-xs text-white/50 font-medium">
            {new Date(post.created_at).toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight font-title">
            {post.title}
          </h1>
          <p className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">
            {post.content}
          </p>
        </div>

        {/* Live Call Block */}
        {post.is_call && (
          <div className="p-5 bg-lilac-dark/45 border border-lilac-light/15 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-inner">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {post.call_status === 'live' ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-[10px] font-black text-rose-500 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    <span>🔴 EM DIRETO</span>
                  </span>
                ) : post.call_status === 'ended' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50">
                    Terminada
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange/10 border border-orange/20 text-[10px] font-bold text-orange">
                    <Calendar className="w-3 h-3" />
                    <span>Agendada</span>
                  </span>
                )}
                <span className="text-xs font-bold text-white/80">
                  {post.call_title || "Chamada de Estudo"}
                </span>
              </div>
              
              <p className="text-xs text-white/60 font-medium">
                Previsão: {post.call_scheduled_at ? new Date(post.call_scheduled_at).toLocaleString('pt-AO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Indefinida"}
              </p>
              
              {/* Confirmed attendance count */}
              <div className="flex items-center gap-2 text-xs text-white/50 font-semibold pt-1">
                <Users className="w-3.5 h-3.5 text-orange" />
                <span>
                  {post.confirmations?.length || 0} confirmados
                </span>
                {post.call_status === 'scheduled' && (
                  <span className="text-orange/80">
                    ({post.confirmations?.length || 0}/5 para início automático)
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* RSVP Button */}
              {post.call_status === 'scheduled' && (
                <button
                  onClick={() => handleConfirmCall(post.confirmations?.some((c: any) => c.user_id === user?.id))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    post.confirmations?.some((c: any) => c.user_id === user?.id)
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white'
                      : 'bg-orange/15 border-orange/25 text-orange hover:bg-orange hover:text-lilac-dark'
                  }`}
                >
                  {post.confirmations?.some((c: any) => c.user_id === user?.id)
                    ? 'Cancelar Presença'
                    : 'Confirmar Presença'}
                </button>
              )}

              {/* Start Manual Button */}
              {post.call_status === 'scheduled' && (
                <button
                  onClick={handleStartCall}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-orange hover:border-orange hover:text-lilac-dark text-white/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Iniciar Manual</span>
                </button>
              )}

              {/* Enter Live Call Button */}
              {post.call_status === 'live' && (
                <button
                  onClick={() => router.push(`/forum/stream/${post.id}`)}
                  className="px-5 py-2 bg-gradient-to-r from-orange to-amber-500 text-lilac-dark rounded-xl text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                >
                  <VideoIcon className="w-3.5 h-3.5 fill-current" />
                  <span>Entrar na Chamada</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          {/* Author */}
          <div className="flex items-center gap-2.5 text-xs text-white/60">
            <div className="p-2 bg-lilac-dark/60 rounded-full border border-lilac-light/20 text-orange shadow-inner">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white/95">{post.author?.full_name || 'Estudante APROVEI'}</p>
              <p className="text-[10px] text-white/55">Autor</p>
            </div>
          </div>

          {/* Likes */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-white/65 hover:text-rose-500 transition text-sm font-bold border border-lilac-light/20 hover:border-rose-500/30 px-4 py-2 rounded-xl bg-lilac-dark/40 shadow-sm"
          >
            <Heart className="w-4.5 h-4.5 text-rose-500 fill-current" />
            <span>Curtir ({post.likes})</span>
          </button>
        </div>
      </div>

      {/* Comments section */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2 font-title">
          <MessageSquare className="w-5 h-5 text-orange" />
          <span>Comentários ({post.comments?.length || 0})</span>
        </h3>

        {/* Form to submit a comment */}
        {token ? (
          <form onSubmit={handleCommentSubmit} className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg p-4 flex gap-3 items-end">
            <textarea
              required
              rows={2}
              placeholder="Escreve um comentário..."
              className="flex-1 px-4 py-3 border border-lilac-light/20 rounded-2xl bg-lilac-dark/40 focus:bg-lilac-dark/60 focus:border-orange/50 focus:ring-2 focus:ring-orange/20 outline-none text-sm md:text-base text-white placeholder:text-white/40 transition resize-none font-medium"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-orange text-lilac-dark p-3.5 rounded-2xl hover:bg-orange/80 transition shadow-[0_0_15px_rgba(255,107,0,0.35)] disabled:opacity-50 disabled:hover:bg-orange disabled:shadow-none shrink-0"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>
        ) : (
          <div className="p-5 bg-lilac-dark/40 border border-lilac-light/20 rounded-2xl text-center text-sm text-white/60 font-medium">
            <span>Precisas de estar </span>
            <a href="/auth/login" className="text-orange font-bold hover:underline">logado</a>
            <span> para participar na discussão.</span>
          </div>
        )}

        {/* Comment list */}
        <div className="space-y-4">
          {post.comments?.length === 0 ? (
            <p className="text-white/50 italic text-sm text-center py-6">Ainda sem comentários. Começa a conversa!</p>
          ) : (
            post.comments?.map((comment: any) => {
              const isMyComment = user && comment.author?.id === user.id;
              return (
                <div key={comment.id} className={`max-w-[85%] sm:max-w-[75%] p-3 md:p-4 shadow-sm space-y-2 transition-all duration-300 ${
                  isMyComment 
                    ? 'ml-auto rounded-2xl rounded-tr-sm bg-green-900/40 border border-green-500/30' 
                    : 'mr-auto rounded-2xl rounded-tl-sm bg-lilac-dark/50 border border-white/5'
                }`}>
                  <div className="flex justify-between items-start gap-4 text-xs">
                    <span className={`font-bold ${isMyComment ? 'text-green-400' : 'text-orange'}`}>
                      {isMyComment ? 'Tu' : (comment.author?.full_name || 'Membro APROVEI')}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm md:text-base leading-relaxed pl-0.5">
                    {comment.content}
                  </p>
                  <div className="text-right">
                    <span className="text-white/40 font-medium text-[10px]">
                      {new Date(comment.created_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
