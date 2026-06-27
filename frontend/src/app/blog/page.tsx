import React from "react";
import { BookOpen, Calendar, ArrowRight, Sparkles } from "lucide-react";

export default function BlogPage() {
  const posts = [
    {
      title: "Como gerir o tempo durante o Exame de Admissão",
      category: "Dicas de Estudo",
      date: "12 Junho 2026",
      excerpt: "Descobre as melhores técnicas para não entrar em pânico e resolver todas as questões a tempo.",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "As profissões com mais futuro em Angola",
      category: "Carreira",
      date: "05 Junho 2026",
      excerpt: "Uma análise baseada na filosofia do PEA sobre as reais necessidades do mercado de trabalho angolano.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Hackathons e Bootcamps: Porquê participar?",
      category: "Inovação",
      date: "28 Maio 2026",
      excerpt: "A importância das atividades de extensão académica para o teu desenvolvimento prático e currículo.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-16 px-4 md:px-8 relative z-10 font-sans">
      {/* Background decorations */}
      <div className="absolute top-[15%] right-[-10%] w-[450px] h-[450px] bg-lilac-light/10 rounded-full filter blur-[130px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[15%] left-[-10%] w-[450px] h-[450px] bg-orange/5 rounded-full filter blur-[130px] -z-10 pointer-events-none"></div>

      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
          <BookOpen className="w-4 h-4 text-orange" />
          <span>Blog do Estudante</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white font-title tracking-tight">
          Novidades e <span className="text-orange-glow">Artigos</span>
        </h1>
        <p className="text-white/60 text-lg font-medium leading-relaxed">
          Notícias, dicas de estudo e insights sobre o mercado, trazidos até ti com o apoio da rede PEA.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <div 
            key={index} 
            className="card-lilac-glass p-0 border border-white/10 bg-lilac-dark/45 hover:border-orange/30 shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group cursor-pointer"
          >
            <div className="h-52 overflow-hidden relative">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-4 left-4 bg-orange text-lilac-dark px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                {post.category}
              </div>
            </div>
            <div className="p-6 space-y-4 flex-grow flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/55 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-orange" />
                  {post.date}
                </div>
                <h3 className="text-xl font-bold text-white leading-snug group-hover:text-orange transition-colors duration-300 font-title">
                  {post.title}
                </h3>
                <p className="text-white/70 text-sm font-medium leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
              <button className="text-orange font-bold text-sm flex items-center gap-2 group/btn pt-4 w-fit hover:text-white transition-colors duration-300">
                <span>Ler Artigo</span> 
                <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center pt-8">
        <button className="bg-orange hover:bg-orange/85 text-lilac-dark font-black px-8 py-4 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(255,107,0,0.35)] text-sm">
          Carregar Mais
        </button>
      </div>
    </div>
  );
}
