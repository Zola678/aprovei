"use client";
import React from 'react';
import { Video, MapPin, Calendar, BookOpen, CheckCircle, ShieldAlert, Award, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PreparatorioPage() {
  const digitalCourses = [
    {
      title: "Intensivo Engenharias & Tecnologias",
      duration: "3 Meses (Pré-Exame)",
      price: "15.000 Kz",
      subjects: "Matemática, Física, Desenho Técnico",
      features: [
        "Aulas ao vivo via Zoom/Jitsi Meet",
        "Acesso ilimitado às gravações por 6 meses",
        "Simulados semanais com correção automática",
        "Grupo exclusivo no WhatsApp com tutores"
      ],
      tag: "Mais Popular",
      gradient: "from-orange to-amber-500"
    },
    {
      title: "Ciências da Saúde & Medicina",
      duration: "3 Meses (Pré-Exame)",
      price: "20.000 Kz",
      subjects: "Biologia, Química, Língua Portuguesa",
      features: [
        "Foco total na prova de ingresso de Medicina da UAN",
        "Material de estudo digital exclusivo incluso",
        "Aulas de Anatomia e Fisiologia simplificadas",
        "2 simulados nacionais cronometrados"
      ],
      tag: "Alta Concorrência",
      gradient: "from-lilac-light to-lilac"
    },
    {
      title: "Ciências Sociais, Humanas & Direito",
      duration: "3 Meses (Pré-Exame)",
      price: "12.000 Kz",
      subjects: "Língua Portuguesa, História, Geografia",
      features: [
        "Revisão profunda de História de Angola e Geral",
        "Técnicas de redação para nota máxima",
        "Fórum de dúvidas aberto 24/7",
        "Apostilas digitais em PDF"
      ],
      tag: "Humanas",
      gradient: "from-amber-500 to-orange"
    }
  ];

  const presencialCourses = [
    {
      title: "Polo Luanda - Centro Talatona",
      price: "35.000 Kz",
      schedule: "Segunda a Sexta (Manhã ou Tarde)",
      address: "Av. Imperial, Edifício Aprovei, Talatona",
      features: [
        "Salas climatizadas e computadores para simulados",
        "Livros didáticos físicos inclusos",
        "Acompanhamento personalizado por professores locais",
        "Sessões presenciais de orientação vocacional"
      ]
    },
    {
      title: "Polo Benguela - Centro Cidade",
      price: "30.000 Kz",
      schedule: "Segunda a Sexta (Pós-Laboral)",
      address: "Rua das Acácias, nº 142, Benguela",
      features: [
        "Professores das principais faculdades locais",
        "Foco nos exames da UKB (Universidade Katyavala Bwila)",
        "Material impresso de exercícios",
        "1 simulado geral presencial ao fim de semana"
      ]
    },
    {
      title: "Polo Huambo - Centro Académico",
      price: "28.000 Kz",
      schedule: "Sábados Intensivos (Integral)",
      address: "Av. Independência, Centro de Formação, Huambo",
      features: [
        "Aulas intensivas focadas nos exames da UMN",
        "Salas de estudo autónomo abertas durante a semana",
        "Resoluções de provas anteriores em grupo",
        "Lanches inclusos"
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
  };

  return (
    <div className="space-y-24 pb-24 overflow-hidden relative z-10 px-4 md:px-8 max-w-[1600px] mx-auto">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-lilac-light/15 rounded-full filter blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-orange/5 rounded-full filter blur-[100px] -z-10 pointer-events-none"></div>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 max-w-4xl mx-auto pt-10"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lilac-base/30 text-white text-sm font-bold border border-lilac-light/20 shadow-[0_0_15px_rgba(123,79,166,0.2)] backdrop-blur-md"
        >
          <Award className="w-5 h-5 text-orange animate-pulse" />
          <span>Matrículas Abertas para o Ano Académico 2026</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight font-title">
          Turmas de Preparatório <br />
          <span className="text-orange-glow">Digital e Presencial</span>
        </h1>
        <p className="text-white/70 font-medium leading-relaxed text-lg md:text-xl max-w-2xl mx-auto">
          Prepara-te com especialistas que conhecem as matrizes dos exames. Escolhe a modalidade que melhor se adapta à tua rotina e garante a tua aprovação.
        </p>
      </motion.section>

      {/* Preparatório Digital */}
      <section className="space-y-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="border-l-4 border-orange pl-6 py-2"
        >
          <h2 className="text-3xl font-black text-white flex items-center gap-3 font-title">
            <div className="p-2 bg-orange/10 rounded-xl border border-orange/20">
              <Video className="w-8 h-8 text-orange" />
            </div>
            <span>Preparatório Digital</span>
          </h2>
          <p className="text-white/60 text-lg font-medium mt-2">Aulas síncronas e plataforma completa sem sair de casa.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {digitalCourses.map((course, idx) => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -10 }}
              key={idx} 
              className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 hover:border-orange/30 shadow-lg relative flex flex-col justify-between overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${course.gradient}`}></div>
              
              {course.tag && (
                <span className={`absolute top-6 right-6 bg-gradient-to-r ${course.gradient} text-lilac-dark text-[10px] px-3.5 py-1.5 rounded-full font-bold uppercase shadow-md`}>
                  {course.tag}
                </span>
              )}
              
              <div className="p-8 space-y-6 flex-1 text-left">
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white leading-snug pr-12 group-hover:text-orange transition-colors font-title">{course.title}</h3>
                  <div className="flex gap-2 text-sm font-bold text-white/50">
                    <span className="bg-lilac-dark/40 px-2.5 py-1 rounded-lg border border-lilac-light/15">{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{course.price}</span>
                  <span className="text-sm font-bold text-white/50">/ Trimestre</span>
                </div>

                <div className="bg-orange/10 p-4 rounded-xl border border-orange/20">
                  <p className="text-xs font-bold text-orange uppercase tracking-wider mb-1">Disciplinas</p>
                  <p className="text-sm font-bold text-white">{course.subjects}</p>
                </div>

                <ul className="space-y-4 pt-2">
                  {course.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex gap-3 items-start text-sm text-white/75 font-medium">
                      <CheckCircle className="w-5 h-5 text-orange shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-lilac-dark/40 border-t border-lilac-light/20">
                <a
                  href="/dashboard"
                  className={`block w-full bg-gradient-to-r ${course.gradient} text-lilac-dark text-center py-4 rounded-xl font-bold hover:shadow-lg transition-all text-sm transform group-hover:scale-[1.02] shadow-md`}
                >
                  Matricular-me Online
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Preparatório Presencial */}
      <section className="space-y-12">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="border-l-4 border-orange pl-6 py-2"
        >
          <h2 className="text-3xl font-black text-white flex items-center gap-3 font-title">
            <div className="p-2 bg-orange/10 rounded-xl border border-orange/20">
              <MapPin className="w-8 h-8 text-orange" />
            </div>
            <span>Polos Presenciais</span>
          </h2>
          <p className="text-white/60 text-lg font-medium mt-2">Estruturas modernas com professores especialistas nas províncias chave.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {presencialCourses.map((course, idx) => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -10 }}
              key={idx} 
              className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 hover:border-orange/30 shadow-lg flex flex-col justify-between overflow-hidden group relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full group-hover:scale-150 transition-transform duration-500 -z-10"></div>
              
              <div className="p-8 space-y-6 flex-1 text-left">
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white flex items-start gap-3 group-hover:text-orange transition-colors leading-snug font-title">
                    <MapPin className="w-6 h-6 text-orange shrink-0 mt-1" />
                    <span>{course.title}</span>
                  </h3>
                  
                  <div className="bg-lilac-dark/40 p-4 rounded-xl border border-lilac-light/15 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-white/80">
                      <Calendar className="w-4 h-4 text-orange" /> 
                      <span>{course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-white/80 truncate">
                      <MapPin className="w-4 h-4 text-orange shrink-0" />
                      <span className="truncate">{course.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-black text-white">{course.price}</span>
                  <span className="text-sm font-bold text-white/50">/ Mês</span>
                </div>

                <ul className="space-y-4 pt-2">
                  {course.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex gap-3 items-start text-sm text-white/75 font-medium">
                      <CheckCircle className="w-5 h-5 text-orange shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-lilac-dark/40 border-t border-lilac-light/20">
                <a
                  href={`https://wa.me/244923000000?text=Olá,%20gostaria%20de%20visitar%20o%20polo%20presencial%20do%20APROVEI%20em%20${course.title.split(' ')[2]}.`}
                  target="_blank"
                  className="block w-full bg-orange text-lilac-dark text-center py-4 rounded-xl font-bold hover:bg-orange/80 transition-all text-sm flex justify-center items-center gap-2 transform group-hover:scale-[1.02] shadow-[0_0_15px_rgba(255,107,0,0.35)]"
                >
                  <MapPin className="w-4 h-4 text-lilac-dark" />
                  <span>Agendar Visita / Matrícula</span>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Resources Included */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 p-10 md:p-16 shadow-2xl grid gap-12 md:grid-cols-2 items-center relative overflow-hidden"
      >
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-orange/5 rounded-full blur-3xl"></div>

        <div className="space-y-6 relative z-10 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange text-sm font-bold border border-orange/20">
            <CheckCircle className="w-4 h-4" />
            <span>Benefícios Inclusos</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white leading-tight font-title">
            O que está incluído no <span className="text-orange-glow">Preparatório Aprovei?</span>
          </h3>
          <p className="text-white/70 text-lg font-medium leading-relaxed">
            O nosso plano pedagógico foi construído especificamente para superar as fragilidades comuns no ensino secundário angolano. O foco está na prática repetida e na auto-avaliação.
          </p>
          <div className="grid gap-4 pt-4">
            {[
              "Garantia de atualização conforme os editais oficiais de 2026",
              "Material de apoio físico entregue em casa ou no polo",
              "Mini-simulados diários pelo WhatsApp",
              "Apoio emocional com psicólogos e ex-alunos admitidos"
            ].map((text, i) => (
              <motion.div 
                whileHover={{ x: 5 }}
                key={i} 
                className="flex items-center gap-3 text-sm text-white/90 font-bold bg-lilac-dark/40 p-3 rounded-xl border border-lilac-light/10 shadow-sm"
              >
                <CheckCircle className="w-5 h-5 text-orange shrink-0" />
                <span>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-lilac-dark/50 p-8 rounded-[2rem] border border-lilac-light/25 space-y-6 shadow-2xl text-center relative z-10"
        >
          <div className="w-20 h-20 mx-auto bg-orange/10 border border-orange/20 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-orange animate-pulse" />
          </div>
          <h4 className="text-2xl font-black text-white font-title">Bolsas APROVEI</h4>
          <p className="text-white/60 font-medium leading-relaxed">
            Oferecemos bolsas de estudos de 100% de desconto para estudantes de famílias vulneráveis ou com excelente desempenho académico no Ensino Médio. As candidaturas abrem trimestralmente.
          </p>
          <a
            href="/forum"
            className="inline-flex items-center gap-2 justify-center w-full py-4 px-6 bg-orange/10 text-orange border border-orange/20 font-bold rounded-xl hover:bg-orange hover:text-lilac-dark transition-colors text-sm"
          >
            <span>Saber mais sobre as bolsas</span>
            <Award className="w-4 h-4" />
          </a>
        </motion.div>
      </motion.section>
    </div>
  );
}
