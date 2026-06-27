"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Link as LinkIcon, Smile, Send, TrendingUp, Award, Flame, Zap, User } from 'lucide-react';
import Link from 'next/link';

const MOCK_POSTS = [
  {
    id: 1,
    author: { name: "Maria Manuel", role: "Estudante", avatar: "MM" },
    time: "2 horas atrás",
    content: "Alguém tem dicas sobre como organizar o tempo para estudar Física e Matemática para o exame da UAN? Sinto que passo muito tempo na teoria e pouca prática.",
    tags: ["Dúvida", "UAN", "Física"],
    likes: 24,
    comments: 5,
    isLiked: false
  },
  {
    id: 2,
    author: { name: "Prof. Alberto Kiala", role: "Tutor", avatar: "AK", isTeacher: true },
    time: "5 horas atrás",
    content: "Novo simulado de Biologia e Química adicionado à plataforma! Foco nas questões de Genética, têm sido muito recorrentes nos últimos 3 anos.",
    tags: ["Aviso", "Biologia", "Material"],
    likes: 89,
    comments: 12,
    isLiked: true
  },
  {
    id: 3,
    author: { name: "João Pedro", role: "Estudante", avatar: "JP" },
    time: "Ontem",
    content: "Finalmente consegui resolver a lista de Limites Notáveis! Agradeço a ajuda da comunidade na semana passada. Partilho aqui as minhas anotações.",
    tags: ["Resoluções", "Matemática", "Conquista"],
    likes: 56,
    comments: 8,
    isLiked: false
  }
];

const TRENDING_TOPICS = [
  { name: "Exames UAN 2026", posts: "1.2k posts" },
  { name: "Bolsas de Estudo", posts: "856 posts" },
  { name: "Dicas de Redação", posts: "643 posts" },
  { name: "Limites Notáveis", posts: "321 posts" }
];

const LEADERBOARD = [
  { name: "Prof. Alberto", points: "15.4k", rank: 1 },
  { name: "Sílvia M.", points: "12.2k", rank: 2 },
  { name: "Carlos A.", points: "9.8k", rank: 3 }
];

export default function ForumPage() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [newPost, setNewPost] = useState("");

  const handleLike = (id: number) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 };
      }
      return post;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      author: { name: "Tu", role: "Estudante", avatar: "TU" },
      time: "Agora mesmo",
      content: newPost,
      tags: ["Discussão"],
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setPosts([post, ...posts]);
    setNewPost("");
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
          
          {/* Create Post Card */}
          <div className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lilac-light to-orange flex items-center justify-center text-white font-bold shrink-0 shadow-md border border-white/20">
                  TU
                </div>
                <textarea 
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Partilha uma dúvida, descoberta ou dica com a comunidade..."
                  className="w-full bg-lilac-dark/40 border border-lilac-light/20 rounded-2xl p-4 text-white placeholder:text-white/40 focus:bg-lilac-dark/60 focus:border-orange/50 focus:ring-2 focus:ring-orange/20 outline-none resize-none min-h-[110px] transition-all shadow-inner font-medium text-sm md:text-base"
                />
              </div>
              <div className="flex items-center justify-between pl-0 sm:pl-16 gap-4">
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
                  disabled={!newPost.trim()}
                  className="bg-orange hover:bg-orange/80 text-lilac-dark px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,107,0,0.35)] disabled:opacity-50 disabled:hover:bg-orange disabled:transform-none disabled:shadow-none"
                >
                  <span className="text-sm md:text-base">Publicar</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Feed Posts */}
          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-lilac-glass hover:border-orange/30 group"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-sm border ${post.author.isTeacher ? 'bg-gradient-to-br from-orange to-amber-500 border-orange/40' : 'bg-lilac-dark/60 text-orange border-lilac-light/30'}`}>
                        {post.author.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white group-hover:text-orange transition-colors">{post.author.name}</h4>
                          {post.author.isTeacher && <Award className="w-4 h-4 text-orange" />}
                        </div>
                        <p className="text-xs text-white/55 flex items-center gap-2 font-medium mt-0.5">
                          <span>{post.author.role}</span>
                          <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                          <span>{post.time}</span>
                        </p>
                      </div>
                    </div>
                    <button className="text-white/40 hover:text-orange transition-colors p-2 hover:bg-white/5 rounded-xl">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <Link href={`/forum/${post.id}`} className="block hover:opacity-90 transition-opacity">
                    <p className="text-white/90 leading-relaxed mb-4 font-medium text-sm md:text-base">
                      {post.content}
                    </p>
                  </Link>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="text-xs font-bold text-orange bg-orange/10 border border-orange/20 px-3 py-1 rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

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
                        <span>{post.comments}</span>
                      </Link>

                      <button className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="hidden sm:inline">Partilhar</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
            <div className="space-y-4">
              {TRENDING_TOPICS.map((topic, i) => (
                <div key={i} className="group cursor-pointer border-b border-white/5 last:border-0 pb-3 last:pb-0">
                  <h4 className="font-bold text-white/90 group-hover:text-orange transition-colors text-sm">{topic.name}</h4>
                  <p className="text-xs text-white/50 mt-1 font-medium">{topic.posts}</p>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-sm font-bold text-orange hover:text-orange/80 transition-colors mt-6">
              Mostrar mais
            </button>
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
                    <div>
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

