"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { MessageSquare, Heart, User, ArrowLeft, Send, CheckCircle2, Award } from 'lucide-react';

export default function PostDetailPage({ params }: { params: { post_id: string } }) {
  const postId = params.post_id;
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [token, setToken] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);

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
            post.comments?.map((comment: any) => (
              <div key={comment.id} className="bg-lilac-dark/30 border border-lilac-light/10 p-5 md:p-6 rounded-3xl shadow-sm space-y-3 hover:border-lilac-light/20 transition-all duration-300">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-lilac-dark/50 rounded-full text-orange/80">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-white/90">
                      {comment.author?.full_name || 'Membro APROVEI'}
                    </span>
                  </div>
                  <span className="text-white/45 font-medium">
                    {new Date(comment.created_at).toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-white/80 text-sm md:text-base leading-relaxed font-medium pl-1">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
