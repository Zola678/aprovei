"use client";
import { useEffect, useState } from 'react';
import api, { getStorageUrl } from '@/lib/api';
import { BookOpen, Search, Filter, Upload, FileText, CheckCircle2, AlertCircle, Plus, Eye, Zap, ArrowRight, GraduationCap, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useModule } from '@/context/ModuleContext';

export default function ExamsPage() {
  const router = useRouter();
  const { activeModule } = useModule();
  
  // Data list
  const [items, setItems] = useState<any[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    university: '',
    subject: '',
    year: '',
    category: '',
    solved: '',
    grade: '' // For high school
  });
  
  // Auth & user info
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Forms
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [materialType, setMaterialType] = useState<'pdf' | 'video'>('pdf');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadData, setUploadData] = useState({
    university: '',
    subject: '',
    year: new Date().getFullYear(),
    category: 'acesso',
    description: '',
    answer_key: '',
    questions_text: '',
    grade: 10, // For high school
    title: ''  // For high school
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  const [solvingExamId, setSolvingExamId] = useState<number | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Carrega dados locais do utilizador
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Recarrega os dados quando o módulo ativo ou os filtros mudam
  useEffect(() => {
    fetchData();
  }, [activeModule, filters.university, filters.subject, filters.year, filters.category, filters.solved, filters.grade]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeModule === 'high_school') {
        // Buscar materiais do Ensino Médio
        let queryParams: string[] = [];
        if (filters.grade) queryParams.push(`grade=${filters.grade}`);
        if (filters.subject) queryParams.push(`subject=${filters.subject}`);
        const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
        
        const res = await api.get(`/materials${queryString}`);
        setItems(res.data);
      } else {
        // Buscar exames de Acesso Superior
        let queryParams: string[] = [];
        if (filters.university) queryParams.push(`university=${filters.university}`);
        if (filters.subject) queryParams.push(`subject=${filters.subject}`);
        if (filters.year) queryParams.push(`year=${filters.year}`);
        if (filters.category) queryParams.push(`category=${filters.category}`);
        if (filters.solved !== '') queryParams.push(`solved=${filters.solved}`);
        const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
        
        const res = await api.get(`/exams${queryString}`);
        setItems(res.data);
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeModule === 'high_school') {
      if (materialType === 'pdf' && !uploadFile) {
        setErrorMsg("Por favor, seleciona o arquivo PDF.");
        return;
      }
      if (materialType === 'video' && !videoUrl.trim()) {
        setErrorMsg("Por favor, insere a URL do vídeo do YouTube.");
        return;
      }
    } else {
      if (!uploadFile) {
        setErrorMsg("Por favor, seleciona o arquivo PDF.");
        return;
      }
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    if (uploadFile && (activeModule !== 'high_school' || materialType === 'pdf')) {
      formData.append("file", uploadFile);
    }

    try {
      if (activeModule === 'high_school') {
        // Upload para materiais de Ensino Médio
        formData.append("grade", String(uploadData.grade));
        formData.append("subject", uploadData.subject);
        formData.append("title", uploadData.title);
        formData.append("description", uploadData.description);
        if (materialType === 'video') {
          formData.append("video_url", videoUrl);
        }

        await api.post('/materials', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        setSuccessMsg("Material escolar cadastrado com sucesso!");
      } else {
        // Upload para exames de Acesso Superior
        formData.append("university", uploadData.university);
        formData.append("subject", uploadData.subject);
        formData.append("year", String(uploadData.year));
        formData.append("category", uploadData.category);
        formData.append("description", uploadData.description);
        formData.append("answer_key", uploadData.answer_key || "");
        formData.append("questions_text", uploadData.questions_text || "");

        await api.post('/exams', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        setSuccessMsg("Prova de acesso cadastrada com sucesso!");
      }

      setShowUploadForm(false);
      setUploadFile(null);
      setVideoUrl('');
      setMaterialType('pdf');
      setUploadData({
        university: '',
        subject: '',
        year: new Date().getFullYear(),
        category: 'acesso',
        description: '',
        answer_key: '',
        questions_text: '',
        grade: 10,
        title: ''
      });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Erro ao efetuar o upload do arquivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSolveSubmit = async (e: React.FormEvent, examId: number) => {
    e.preventDefault();
    if (!solutionFile) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append("solution_file", solutionFile);

    try {
      await api.post(`/exams/${examId}/solve`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccessMsg("Resolução oficial associada com sucesso!");
      setSolvingExamId(null);
      setSolutionFile(null);
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Erro ao carregar ficheiro de resolução.");
    } finally {
      setLoading(false);
    }
  };

  const getFullPdfUrl = (url: string) => {
    return getStorageUrl(url);
  };

  const isTeacherOrAdmin = user && (user.role === 'teacher' || user.role === 'admin');

  return (
    <div className="space-y-12 pb-16 relative font-sans px-4 md:px-6 z-10 max-w-[1600px] mx-auto">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-lilac-light/10 rounded-full filter blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-orange/5 rounded-full filter blur-[80px] -z-10 pointer-events-none"></div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="text-left">
          <h2 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 font-title tracking-tight">
            <div className="p-3 bg-orange/10 border border-orange/20 rounded-2xl text-orange shadow-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <span>
              {user?.role === "admin" 
                ? "Gestão Global de Provas e Materiais" 
                : (activeModule === "high_school" ? "Biblioteca do Ensino Médio" : "Banco de Provas")}
            </span>
            {user?.role === "admin" && (
              <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30 uppercase tracking-widest ml-2 hidden md:inline-block">Admin</span>
            )}
          </h2>
          <p className="text-white/70 font-medium mt-3 text-lg">
            {user?.role === "admin" 
              ? "Supervisione, edite e carregue materiais educativos de forma irrestrita."
              : (activeModule === "high_school" 
                ? "Acede a manuais, fichas e resumos para a 10ª, 11ª e 12ª classe."
                : "Acede aos exames anteriores das melhores universidades e prepara-te com casos reais.")}
          </p>
        </div>
        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-orange text-lilac-dark px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange/80 shadow-[0_0_15px_rgba(255,107,0,0.35)] transition-all transform hover:-translate-y-0.5 text-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>
              {activeModule === "high_school" ? "Novo Material" : "Nova Prova"}
            </span>
          </button>
        )}
      </motion.div>

      {/* Dynamic Banner (Exams Simulation / AI Help) */}
      {activeModule !== "high_school" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-orange to-amber-600 rounded-[2rem] p-8 md:p-10 text-lilac-dark flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg relative overflow-hidden text-left"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lilac-dark/20 text-lilac-dark text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-lilac-dark/10">
              <Zap className="w-4 h-4 text-lilac-dark animate-pulse" />
              <span>Simulador Inteligente</span>
            </div>
            <h3 className="text-3xl font-black font-title">Simulação de Exame com Temporizador</h3>
            <p className="text-lilac-dark/80 font-medium text-lg max-w-2xl">
              Gera simulados personalizados baseados no perfil das provas oficiais da UAN, ISUTIC e UMN. Avalia o teu tempo e recebe notas instantâneas.
            </p>
          </div>
          <button
            onClick={() => router.push('/exams/simulation')}
            className="relative z-10 bg-lilac-dark text-orange hover:bg-lilac-dark/90 active:scale-95 transition-all duration-300 px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 shadow-md whitespace-nowrap"
          >
            <span>Iniciar Simulação</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl flex items-center gap-3 font-bold shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 font-bold shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Form */}
      <AnimatePresence>
        {showUploadForm && isTeacherOrAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg space-y-8 text-left"
          >
            <h3 className="text-2xl font-black text-white flex items-center gap-2 font-title">
              <Upload className="w-6 h-6 text-orange" />
              <span>
                {activeModule === "high_school" ? "Adicionar Material Escolar" : "Cadastrar Prova no Banco"}
              </span>
            </h3>
            
            <form onSubmit={handleUploadSubmit} className="grid gap-6 md:grid-cols-2">
              {activeModule === "high_school" ? (
                // FORMULÁRIO DO ENSINO MÉDIO
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Título do Material</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sebenta de Trigonometria da 11ª Classe"
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                      value={uploadData.title}
                      onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Disciplina</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Matemática, Física, Língua Portuguesa"
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                      value={uploadData.subject}
                      onChange={e => setUploadData({ ...uploadData, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Classe</label>
                    <select
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm cursor-pointer transition-all text-white font-semibold shadow-sm appearance-none"
                      value={uploadData.grade}
                      onChange={e => setUploadData({ ...uploadData, grade: parseInt(e.target.value) })}
                    >
                      <option value={10} className="bg-lilac-dark text-white">10ª Classe</option>
                      <option value={11} className="bg-lilac-dark text-white">11ª Classe</option>
                      <option value={12} className="bg-lilac-dark text-white">12ª Classe</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Tipo de Material</label>
                    <select
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm cursor-pointer transition-all text-white font-semibold shadow-sm appearance-none"
                      value={materialType}
                      onChange={e => setMaterialType(e.target.value as 'pdf' | 'video')}
                    >
                      <option value="pdf" className="bg-lilac-dark text-white">Documento PDF (Manual/Ficha)</option>
                      <option value="video" className="bg-lilac-dark text-white">Vídeo Aula (YouTube Link)</option>
                    </select>
                  </div>
                </>
              ) : (
                // FORMULÁRIO DO ENSINO SUPERIOR
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Universidade / Instituição</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: UAN, ISUTIC, UMN"
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                      value={uploadData.university}
                      onChange={e => setUploadData({ ...uploadData, university: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Disciplina</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Matemática, Física, História"
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                      value={uploadData.subject}
                      onChange={e => setUploadData({ ...uploadData, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Ano da Prova</label>
                    <input
                      type="number"
                      required
                      min={2000}
                      max={2030}
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                      value={uploadData.year}
                      onChange={e => setUploadData({ ...uploadData, year: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Categoria</label>
                    <select
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm cursor-pointer transition-all text-white font-semibold shadow-sm appearance-none"
                      value={uploadData.category}
                      onChange={e => setUploadData({ ...uploadData, category: e.target.value })}
                    >
                      <option value="acesso" className="bg-lilac-dark text-white">Exame de Acesso Geral</option>
                      <option value="exame_especial" className="bg-lilac-dark text-white">Exame Especial / Época Especial</option>
                    </select>
                  </div>
                </>
              )}

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Descrição / Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Exercícios resolvidos com foco em exames passados"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                  value={uploadData.description}
                  onChange={e => setUploadData({ ...uploadData, description: e.target.value })}
                />
              </div>

              {activeModule !== 'high_school' && (
                <>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Chave de Respostas / Gabarito Oficial (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: 1-A, 2-C, 3-A, 4-A"
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                      value={uploadData.answer_key}
                      onChange={e => setUploadData({ ...uploadData, answer_key: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Texto das Questões para Desafios IA (Opcional)</label>
                    <textarea
                      placeholder="Questão 1: Se f(x) = x^2 - 4x + 3, qual é o valor mínimo de f(x)?&#10;A) -1&#10;B) 0&#10;C) 1&#10;D) 3&#10;&#10;Questão 2: ..."
                      rows={5}
                      className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30 resize-y"
                      value={uploadData.questions_text}
                      onChange={e => setUploadData({ ...uploadData, questions_text: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Arquivo ou Vídeo condicionado */}
              {(activeModule !== 'high_school' || materialType === 'pdf') ? (
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Arquivo PDF</label>
                  <input
                    type="file"
                    required
                    accept="application/pdf"
                    className="w-full p-2 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm bg-lilac-dark/55 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange/10 file:text-orange hover:file:bg-orange/20 text-white"
                    onChange={e => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  />
                </div>
              ) : (
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-wider">URL do Vídeo do YouTube</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                  />
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-6 py-3 border border-lilac-light/25 text-white/60 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-orange text-lilac-dark rounded-xl text-sm font-bold hover:bg-orange/80 transition-all disabled:opacity-70 shadow-[0_0_15px_rgba(255,107,0,0.35)]"
                >
                  {loading ? "A processar..." : "Submeter Ficheiro"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adaptive Filters Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg grid gap-4 items-center relative z-10 md:grid-cols-4 lg:grid-cols-5 p-6 text-left"
      >
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
          <input
            type="text"
            name="subject"
            placeholder="Filtrar disciplina..."
            className="w-full pl-10 pr-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold text-white outline-none transition-all shadow-sm placeholder:text-white/35"
            value={filters.subject}
            onChange={handleFilterChange}
          />
        </div>

        {activeModule === 'high_school' ? (
          // FILTROS ENSINO MÉDIO
          <div>
            <select
              name="grade"
              className="w-full px-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold text-white outline-none cursor-pointer transition-all shadow-sm appearance-none"
              value={filters.grade}
              onChange={handleFilterChange}
            >
              <option value="" className="bg-lilac-dark text-white">Todas as Classes</option>
              <option value="10" className="bg-lilac-dark text-white">10ª Classe</option>
              <option value="11" className="bg-lilac-dark text-white">11ª Classe</option>
              <option value="12" className="bg-lilac-dark text-white">12ª Classe</option>
            </select>
          </div>
        ) : (
          // FILTROS ENSINO SUPERIOR
          <>
            <div>
              <select
                name="university"
                className="w-full px-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold text-white outline-none cursor-pointer transition-all shadow-sm appearance-none"
                value={filters.university}
                onChange={handleFilterChange}
              >
                <option value="" className="bg-lilac-dark text-white">Todas Universidades</option>
                <option value="UAN" className="bg-lilac-dark text-white">UAN</option>
                <option value="ISUTIC" className="bg-lilac-dark text-white">ISUTIC</option>
                <option value="UMN" className="bg-lilac-dark text-white">UMN</option>
                <option value="UKB" className="bg-lilac-dark text-white">UKB</option>
                <option value="IMETRO" className="bg-lilac-dark text-white">IMETRO</option>
              </select>
            </div>

            <div>
              <select
                name="year"
                className="w-full px-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold text-white outline-none cursor-pointer transition-all shadow-sm appearance-none"
                value={filters.year}
                onChange={handleFilterChange}
              >
                <option value="" className="bg-lilac-dark text-white">Todos os Anos</option>
                <option value="2025" className="bg-lilac-dark text-white">2025</option>
                <option value="2024" className="bg-lilac-dark text-white">2024</option>
                <option value="2023" className="bg-lilac-dark text-white">2023</option>
                <option value="2022" className="bg-lilac-dark text-white">2022</option>
                <option value="2021" className="bg-lilac-dark text-white">2021</option>
              </select>
            </div>

            <div>
              <select
                name="category"
                className="w-full px-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold text-white outline-none cursor-pointer transition-all shadow-sm appearance-none"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="" className="bg-lilac-dark text-white">Todas Categorias</option>
                <option value="acesso" className="bg-lilac-dark text-white">Exame de Acesso</option>
                <option value="exame_especial" className="bg-lilac-dark text-white">Exame Especial</option>
              </select>
            </div>

            <div>
              <select
                name="solved"
                className="w-full px-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold text-white outline-none cursor-pointer transition-all shadow-sm appearance-none"
                value={filters.solved}
                onChange={handleFilterChange}
              >
                <option value="" className="bg-lilac-dark text-white">Resoluções</option>
                <option value="true" className="bg-lilac-dark text-white">Apenas Resolvidas</option>
                <option value="false" className="bg-lilac-dark text-white">Não Resolvidas</option>
              </select>
            </div>
          </>
        )}
      </motion.div>

      {/* Grid List */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {items.length === 0 ? (
          <div className="md:col-span-full text-center py-24 card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-lg space-y-6">
            <div className="w-20 h-20 bg-lilac-dark/50 rounded-full flex items-center justify-center mx-auto border border-lilac-light/20">
              <FileText className="w-10 h-10 text-white/50" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-title">Nenhum material encontrado</h3>
              <p className="text-white/60 font-medium max-w-sm mx-auto mt-2">
                Tenta reajustar os teus filtros de pesquisa ou seleciona outro módulo de estudos.
              </p>
            </div>
          </div>
        ) : (
          items.map((item: any) => {
            const examKey = activeModule !== 'high_school' 
              ? `${item.university}-${item.subject.substring(0, 3).toUpperCase()}-${item.year}`.replace(/\s+/g, '').toUpperCase()
              : `M${item.grade}-${item.subject.substring(0, 3).toUpperCase()}-${item.id}`.replace(/\s+/g, '').toUpperCase();

            return (
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                }}
                whileHover={{ y: -8 }}
                key={item.id} 
                className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-sm hover:border-orange/40 transition-all duration-300 flex flex-col justify-between space-y-8 relative overflow-hidden group cursor-pointer p-8"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                
                {activeModule !== 'high_school' && item.solved && (
                  <div className="absolute top-0 right-0 bg-green-500 text-lilac-dark text-xs px-4 py-1.5 font-bold rounded-bl-2xl flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolvida</span>
                  </div>
                )}
                
                <div className="space-y-4 relative z-10 text-left">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-orange/10 text-orange border border-orange/20 text-xs px-3 py-1.5 rounded-xl font-bold">
                      {activeModule === 'high_school' ? `${item.grade}ª Classe` : item.university}
                    </span>
                    <span className="bg-lilac-dark/60 text-white/70 border border-lilac-light/20 text-xs px-3 py-1.5 rounded-xl font-bold uppercase">
                      {activeModule === 'high_school' ? item.subject : (item.category === 'acesso' ? 'Acesso' : 'Especial')}
                    </span>
                    {activeModule !== 'high_school' && (
                      <span className="bg-orange/10 text-orange border border-orange/20 text-xs px-3 py-1.5 rounded-xl font-bold">
                        {item.year}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-orange transition-colors leading-tight font-title">
                      {activeModule === 'high_school' ? item.title : item.subject}
                    </h3>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-white/40 uppercase">Chave:</span>
                      <span className="text-[10px] font-mono font-bold text-orange px-2 py-0.5 rounded bg-orange/15 select-all border border-orange/20">{examKey}</span>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-white/70 font-medium text-sm leading-relaxed">{item.description}</p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                  <div className="flex gap-3">
                    {activeModule === 'high_school' && (item.file_url.startsWith('http') || item.file_url.includes('youtube.com') || item.file_url.includes('youtu.be')) ? (
                      <a
                        href={item.file_url}
                        target="_blank"
                        className="flex-1 bg-orange/10 border border-orange/20 text-orange px-4 py-3.5 rounded-xl font-bold hover:bg-orange hover:text-lilac-dark transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Play className="w-4 h-4" />
                        <span>Assistir Vídeo</span>
                      </a>
                    ) : (
                      <a
                        href={getFullPdfUrl(activeModule === 'high_school' ? item.file_url : item.pdf_url)}
                        target="_blank"
                        className="flex-1 bg-lilac-dark/60 text-white/80 px-4 py-3.5 rounded-xl font-bold hover:bg-lilac-dark/80 hover:border-orange/40 hover:text-orange transition-all text-sm flex items-center justify-center gap-2 border border-lilac-light/25 shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver PDF</span>
                      </a>
                    )}
                    
                    {activeModule !== 'high_school' && (
                      item.solved ? (
                        <a
                          href={getFullPdfUrl(item.solution_pdf_url)}
                          target="_blank"
                          className="flex-1 bg-green-500/15 border border-green-500/30 text-green-400 px-4 py-3.5 rounded-xl font-bold hover:bg-green-500 hover:text-lilac-dark transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Resolução</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex-1 bg-lilac-dark/40 text-white/30 px-4 py-3.5 rounded-xl font-bold text-sm cursor-not-allowed border border-lilac-light/15"
                        >
                          Pendente
                        </button>
                      )
                    )}
                  </div>

                  {/* AI Challenge shortcut button */}
                  <button
                    onClick={() => router.push(`/ai-chat?challenge=${examKey}`)}
                    className="w-full bg-orange text-lilac-dark px-4 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-orange/80 shadow-md transition-all active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4 text-lilac-dark fill-current" />
                    <span>Desafiar IA nesta Prova 🎯</span>
                  </button>

                  {/* Resolução form for teachers on University Exams */}
                  {activeModule !== 'high_school' && isTeacherOrAdmin && !item.solved && (
                    <div className="pt-2">
                      <button
                        onClick={() => setSolvingExamId(solvingExamId === item.id ? null : item.id)}
                        className="text-xs text-orange font-bold hover:text-orange/80 flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{solvingExamId === item.id ? 'Fechar' : 'Carregar Resolução'}</span>
                      </button>

                      <AnimatePresence>
                        {solvingExamId === item.id && (
                          <motion.form 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            onSubmit={(e) => handleSolveSubmit(e, item.id)} 
                            className="space-y-3 bg-lilac-dark/50 p-4 rounded-xl border border-lilac-light/20 overflow-hidden shadow-sm text-left"
                          >
                            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">PDF da Resolução</label>
                            <div className="flex gap-2">
                              <input
                                type="file"
                                required
                                accept="application/pdf"
                                className="text-xs flex-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange/10 file:text-orange file:cursor-pointer text-white"
                                onChange={e => setSolutionFile(e.target.files ? e.target.files[0] : null)}
                              />
                              <button
                                type="submit"
                                disabled={loading}
                                className="bg-orange text-lilac-dark text-xs px-4 py-2 rounded-lg font-bold hover:bg-orange/80 disabled:bg-lilac-dark/40 transition-colors shadow-sm"
                              >
                                Enviar
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
