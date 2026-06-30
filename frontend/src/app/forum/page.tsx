"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Smile, 
  Send, 
  TrendingUp, 
  Award, 
  Flame, 
  Zap, 
  User, 
  Plus, 
  Sparkles, 
  Hash, 
  FlaskConical, 
  Dna, 
  GraduationCap, 
  BookOpen,
  MessageSquare 
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

const CATEGORIES = [
  { id: 'all', name: 'Todos os Debates', icon: 'Sparkles', description: 'Visão geral de todas as discussões da comunidade.' },
  { id: 'Geral', name: 'Geral', icon: 'MessageSquare', description: 'Dúvidas gerais, conversas e temas livres.' },
  { id: 'Matemática', name: 'Matemática', icon: 'Hash', description: 'Resoluções, limites, derivadas e geometria.' },
  { id: 'Física', name: 'Física', icon: 'Zap', description: 'Mecânica, eletricidade, termodinâmica e óptica.' },
  { id: 'Química', name: 'Química', icon: 'FlaskConical', description: 'Reações, estequiometria, orgânica e soluções.' },
  { id: 'Biologia', name: 'Biologia', icon: 'Dna', description: 'Genética, citologia, evolução e ecologia.' },
  { id: 'Exames de Acesso', name: 'Exames de Acesso', icon: 'GraduationCap', description: 'Editais, provas antigas, calendários e novidades da UAN, ISUTIC, UMN, etc.' },
  { id: 'Dicas de Estudo', name: 'Dicas de Estudo', icon: 'BookOpen', description: 'Técnicas de estudo, cronogramas e produtividade.' }
];

const CATEGORY_GROUPS = [
  {
    name: "Comunidade & Apoio",
    categories: ['all', 'Geral', 'Dicas de Estudo']
  },
  {
    name: "Ciências & Exatas",
    categories: ['Matemática', 'Física', 'Química', 'Biologia']
  },
  {
    name: "Admissão & Preparação",
    categories: ['Exames de Acesso']
  }
];

const categoryIcons: Record<string, React.ComponentType<any>> = {
  Sparkles: Sparkles,
  MessageSquare: MessageSquare,
  Hash: Hash,
  Zap: Zap,
  FlaskConical: FlaskConical,
  Dna: Dna,
  GraduationCap: GraduationCap,
  BookOpen: BookOpen
};

const TRENDING_TOPICS = [
  { name: "Exames UAN 2026", posts: "1.2k posts" },
  { name: "Bolsas de Estudo", posts: "856 posts" },
  { name: "Dicas de Redação", posts: "643 posts" },
  { name: "Limites Notáveis", posts: "321 posts" }
];

const LEADERBOARD = [
  { name: "Prof. Alberto Kiala", points: "15.4k", rank: 1 },
  { name: "Sílvia M.", points: "12.2k", rank: 2 },
  { name: "Carlos A.", points: "9.8k", rank: 3 }
];

export default function ForumPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Geral');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState('');

  // Fetch token and user on mount
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
  }, []);

  const fetchPosts = async (cat: string) => {
    setLoading(true);
    try {
      const url = cat === 'all' ? '/forum' : `/forum?category=${cat}`;
      const res = await api.get(url);
      setPosts(res.data);
    } catch (err) {
      console.error("Erro ao buscar debates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeCategory);
  }, [activeCategory]);

  const handleLike = async (id: number) => {
    if (!token) {
      alert("Precisas de fazer login para curtir discussões.");
      return;
    }
    try {
      const res = await api.post(`/forum/${id}/like`);
      setPosts(prev => prev.map(post => {
        if (post.id === id) {
          return { ...post, likes: res.data.likes, isLiked: true };
        }
        return post;
      }));
    } catch (err) {
      console.error("Erro ao curtir debate:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (!token) {
      alert("Precisas de estar logado para publicar no fórum.");
      return;
    }

    setIsSubmitting(true);
    setPostError('');
    try {
      const res = await api.post('/forum', {
        title,
        content,
        category
      });
      setPosts(prev => [res.data, ...prev]);
      setTitle('');
      setContent('');
    } catch (err: any) {
      console.error("Erro ao criar debate:", err);
      setPostError(err.response?.data?.detail || "Erro ao publicar debate. Tenta novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:8000/${url}`;
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-[1600px] mx-auto relative z-10">
      
      {/* Background radial highlights */}
      <div className="absolute top-[10%] right-[-15%] w-[600px] h-[600px] bg-lilac-light/10 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-15%] w-[600px] h-[600px] bg-orange/5 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>

      {/* Hero Header */}
      <div className="text-left space-y-4 mb-10 mt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lilac-base/30 border border-lilac-light/20 text-xs font-bold text-white/90 shadow-[0_0_15px_rgba(123,79,166,0.2)] backdrop-blur-md">
          <Flame className="w-3.5 h-3.5 text-orange animate-pulse" />
          <span>Comunidade APROVEI</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight font-title">
          Fórum da <span className="text-orange-glow">Comunidade</span>
        </h1>
        <p className="text-white/70 max-w-2xl text-base md:text-lg font-medium">
          Partilha dúvidas, coopera com colegas de todo o país e aprende com tutores experientes. A aprovação constrói-se juntos.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Feed */}
        <div className="flex-1 space-y-6">

          {/* Grouped Categories Selector */}
          <div className="card-lilac-glass border-lilac-light/25 bg-lilac-base/15 p-6 rounded-[2rem] text-left">
            <h3 className="text-xs font-black uppercase text-orange tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange" />
              <span>Grupos de Debates & Fóruns</span>
            </h3>
            <div className="grid gap-6 sm:grid-cols-3">
              {CATEGORY_GROUPS.map((group) => (
                <div key={group.name} className="space-y-3 bg-lilac-dark/25 p-4 rounded-2xl border border-lilac-light/5 shadow-inner">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider ml-1">{group.name}</h4>
                  <div className="flex flex-col gap-2">
                    {group.categories.map((catId) => {
                      const cat = CATEGORIES.find(c => c.id === catId);
                      if (!cat) return null;
                      const IconComp = categoryIcons[cat.icon] || MessageSquare;
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id)}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-bold text-left transition-all duration-300 w-full ${
                            isActive 
                              ? 'bg-orange text-lilac-dark border-orange shadow-[0_0_12px_rgba(255,107,0,0.3)]' 
                              : 'bg-lilac-dark/45 hover:bg-lilac-dark/70 text-white/70 hover:text-white border-lilac-light/10 hover:border-orange/20'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-lilac-dark' : 'text-orange'}`} />
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group Header details */}
          {activeCategory !== 'all' && (
            <div className="mb-6 p-5 rounded-3xl bg-lilac-base/10 border border-lilac-light/20 backdrop-blur-md text-left flex items-start gap-4">
              <div className="p-3 bg-orange/10 rounded-2xl border border-orange/20 text-orange shrink-0">
                {React.createElement(categoryIcons[CATEGORIES.find(c => c.id === activeCategory)?.icon || 'MessageSquare'] || MessageSquare, { className: "w-6 h-6" })}
              </div>
              <div>
                <h2 className="text-xl font-black text-white font-title mb-1">
                  Grupo: {CATEGORIES.find(c => c.id === activeCategory)?.name}
                </h2>
                <p className="text-sm text-white/70 font-medium">
                  {CATEGORIES.find(c => c.id === activeCategory)?.description}
                </p>
              </div>
            </div>
          )}
          
          {/* Create Post Card */}
          {!token ? (
            <div className="card-lilac-glass border-lilac-light/20 bg-lilac-base/10 p-6 rounded-3xl text-center text-sm text-white/70 font-semibold">
              <span>Desejas iniciar uma nova discussão? </span>
              <a href="/auth/login" className="text-orange font-bold hover:underline">Fazer Login</a>
              <span> ou </span>
              <a href="/auth/register" className="text-orange font-bold hover:underline">Registar-se</a>
              <span> para participar no fórum.</span>
            </div>
          ) : (
            <div className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg text-left p-6 md:p-8 rounded-[2rem]">
              <h3 className="text-lg font-black text-white font-title mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange" />
                <span>Iniciar nova Discussão</span>
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {postError && (
                  <div className="p-3 text-xs text-rose-400 bg-rose-950/40 rounded-xl border border-rose-800/40 font-bold">
                    {postError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider ml-1">Título do Debate</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Como resolver limites exponenciais?"
                      required
                      className="w-full bg-lilac-dark/40 border border-lilac-light/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:bg-lilac-dark/60 focus:border-orange/50 outline-none transition-all font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider ml-1">Grupo / Categoria</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-lilac-dark/40 border border-lilac-light/20 rounded-xl px-4 py-2.5 text-white focus:bg-lilac-dark/60 focus:border-orange/50 outline-none transition-all font-semibold text-sm cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id} className="bg-lilac-dark text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider ml-1">Conteúdo da Publicação</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escreve aqui os detalhes da tua dúvida, descoberta ou dica..."
                    required
                    className="w-full bg-lilac-dark/40 border border-lilac-light/20 rounded-xl p-4 text-white placeholder:text-white/30 focus:bg-lilac-dark/60 focus:border-orange/50 outline-none resize-none min-h-[100px] transition-all font-medium text-sm"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-1 sm:gap-2">
                    <button type="button" className="p-2 text-white/50 hover:text-orange hover:bg-white/5 rounded-xl transition-colors" title="Adicionar imagem">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-white/50 hover:text-orange hover:bg-white/5 rounded-xl transition-colors" title="Adicionar link">
                      <LinkIcon className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-white/50 hover:text-orange hover:bg-white/5 rounded-xl transition-colors" title="Adicionar emoji">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="bg-orange hover:bg-orange/80 text-lilac-dark px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,107,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Publicando...' : 'Publicar'}</span>
                    <Send className="w-4 h-4 text-lilac-dark" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Feed Posts */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-20 card-lilac-glass bg-lilac-base/10 border-lilac-light/20 rounded-[2rem]">
                <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/60 font-semibold">Buscando discussões do grupo...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 card-lilac-glass bg-lilac-base/10 border-lilac-light/20 rounded-[2rem]">
                <p className="text-white/50 font-semibold italic">Nenhum debate encontrado neste grupo. Sê o primeiro a iniciar um!</p>
              </div>
            ) : (
              <AnimatePresence>
                {posts.map((post) => {
                  const initials = post.author?.full_name 
                    ? post.author.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'U';
                  const formattedDate = post.created_at
                    ? new Date(post.created_at).toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : 'Algum tempo';
                  const isTeacher = post.author?.role === 'teacher';

                  return (
                    <motion.div 
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-lilac-glass hover:border-orange/30 group text-left"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm border overflow-hidden ${isTeacher ? 'bg-gradient-to-br from-orange to-amber-500 border-orange/40' : 'bg-lilac-dark/60 text-orange border-lilac-light/30'}`}>
                            {post.author?.photo_url ? (
                              <img src={getFullUrl(post.author.photo_url)} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white group-hover:text-orange transition-colors">
                                {post.author?.full_name || 'Membro APROVEI'}
                              </h4>
                              {isTeacher && (
                                <span title="Tutor Verificado">
                                  <Award className="w-4 h-4 text-orange" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/55 flex items-center gap-2 font-medium mt-0.5">
                              <span>{isTeacher ? 'Tutor' : 'Estudante'}</span>
                              <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                              <span>{formattedDate}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-orange bg-orange/10 border border-orange/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {post.category}
                        </span>
                      </div>

                      {/* Content */}
                      <Link href={`/forum/${post.id}`} className="block hover:opacity-90 transition-opacity space-y-2 mb-4">
                        <h3 className="text-base md:text-lg font-bold text-white group-hover:text-orange transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-white/80 leading-relaxed font-medium text-sm md:text-base line-clamp-3">
                          {post.content}
                        </p>
                      </Link>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-6">
                          <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.isLiked ? 'text-rose-500' : 'text-white/60 hover:text-rose-500'}`}
                          >
                            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          
                          <Link href={`/forum/${post.id}`} className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-orange transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span>{post.comments?.length || 0}</span>
                          </Link>

                          <button 
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                navigator.clipboard.writeText(`${window.location.origin}/forum/${post.id}`);
                                alert("Link copiado para a área de transferência!");
                              }
                            }}
                            className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
                          >
                            <Share2 className="w-5 h-5" />
                            <span className="hidden sm:inline">Partilhar</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
          
          {/* Trending Topics */}
          <div className="card-lilac-glass border-lilac-light/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange/10 rounded-xl border border-orange/20">
                <TrendingUp className="w-5 h-5 text-orange" />
              </div>
              <h3 className="font-bold text-white text-lg font-title">Em Alta</h3>
            </div>
            <div className="space-y-4 text-left">
              {TRENDING_TOPICS.map((topic, i) => (
                <div key={i} className="group cursor-pointer border-b border-white/5 last:border-0 pb-3 last:pb-0">
                  <h4 className="font-bold text-white/90 group-hover:text-orange transition-colors text-sm">{topic.name}</h4>
                  <p className="text-xs text-white/50 mt-1 font-medium">{topic.posts}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard (Gamification) */}
          <div className="card-lilac-glass border-lilac-light/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-bl-full blur-2xl"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-orange/10 rounded-xl border border-orange/20">
                <Flame className="w-5 h-5 text-orange" />
              </div>
              <h3 className="font-bold text-white text-lg font-title">Top Contribuidores</h3>
            </div>
            <div className="space-y-4 relative z-10">
              {LEADERBOARD.map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-lilac-dark/40 border border-lilac-light/10 hover:border-orange/20 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border ${i === 0 ? 'bg-orange text-lilac-dark border-orange/20 shadow-[0_0_10px_rgba(255,107,0,0.4)]' : 'bg-lilac-dark/60 border border-lilac-light/20 text-white/70'}`}>
                      {i + 1}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-white text-sm">{user.name}</h4>
                      <p className="text-xs text-orange font-bold flex items-center gap-1 mt-0.5">
                        <Zap className="w-3 h-3 fill-current animate-pulse" />
                        {user.points} XP
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

