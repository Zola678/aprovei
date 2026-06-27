"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Search, MapPin, Users, Star, MessageSquare, Plus, Save, AlertCircle, CheckCircle2, Navigation, Clock, ShieldCheck, Zap, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/Map'), { 
  ssr: false, 
  loading: () => <div className="h-[400px] bg-lilac-dark/40 animate-pulse rounded-[2rem] flex items-center justify-center text-white/50 font-bold border border-lilac-light/20">A carregar mapa com localização dos professores...</div> 
});

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    max_price: ''
  });
  
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Profile editing
  const [myProfile, setMyProfile] = useState<any>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showApplyProfile, setShowApplyProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    specialty: '',
    bio: '',
    price_per_hour: 3000,
    whatsapp: '',
    location: '',
    subject_tags: ''
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Booking Flow State: { [teacherId]: 'idle' | 'requested' | 'accepted' | 'paid' }
  const [bookingStates, setBookingStates] = useState<Record<number, string>>({});

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'teacher' && storedToken) {
        fetchMyProfile(storedToken);
      }
    }
    
    // Mock check if user has an application pending
    const pendingApp = localStorage.getItem('teacher_application_pending');
    if (pendingApp === 'true') {
      setApplicationStatus('pending');
    }

    fetchTeachers();
  }, []);

  const fetchTeachers = async (customFilters = filters) => {
    try {
      let queryParams: string[] = [];
      if (customFilters.specialty) queryParams.push(`specialty=${customFilters.specialty}`);
      if (customFilters.location) queryParams.push(`location=${customFilters.location}`);
      if (customFilters.max_price) queryParams.push(`max_price=${customFilters.max_price}`);
      
      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/teachers${queryString}`);
      setTeachers(res.data);
    } catch (err) {
      console.error("Erro ao obter professores", err);
    }
  };

  const fetchMyProfile = async (authToken: string) => {
    try {
      const res = await api.get('/teachers');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const profile = res.data.find((t: any) => t.user_id === currentUser.id);
      if (profile) {
        setMyProfile(profile);
        setProfileData({
          specialty: profile.specialty,
          bio: profile.bio || '',
          price_per_hour: profile.price_per_hour,
          whatsapp: profile.whatsapp || '',
          location: profile.location || '',
          subject_tags: profile.subject_tags || ''
        });
      }
    } catch (err) {
      console.log("Perfil ainda não criado.");
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchTeachers(newFilters);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const endpoint = myProfile ? '/teachers' : '/teachers';
      const method = myProfile ? 'put' : 'post';
      
      const res = await api[method](endpoint, profileData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMyProfile(res.data);
      setSuccessMsg("Perfil atualizado com sucesso!");
      setShowEditProfile(false);
      fetchTeachers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) {
      setErrorMsg('Por favor, anexa o teu currículo ou certificado.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Mock API call for application
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Candidatura enviada com sucesso! A nossa equipa irá analisar o teu perfil.");
      setApplicationStatus('pending');
      localStorage.setItem('teacher_application_pending', 'true');
      setShowApplyProfile(false);
    }, 2000);
  };

  const handleBookingRequest = (teacherId: number) => {
    // Request phase
    setBookingStates(prev => ({ ...prev, [teacherId]: 'requested' }));

    // Simulate acceptance after 3 seconds
    setTimeout(() => {
      setBookingStates(prev => ({ ...prev, [teacherId]: 'accepted' }));
    }, 3000);
  };

  const handlePayment = (teacherId: number) => {
    // Simulate payment processing
    setBookingStates(prev => ({ ...prev, [teacherId]: 'paid' }));
  };

  const isTeacher = user && user.role === 'teacher';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } }
  };

  return (
    <div className="space-y-12 pb-16 relative px-4 md:px-6 z-10 max-w-[1600px] mx-auto font-sans">
      {/* Background decorations */}
      <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-lilac-light/10 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-40 left-0 w-[600px] h-[600px] bg-orange/5 rounded-full filter blur-[150px] -z-10 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="text-left">
          <h2 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 font-title tracking-tight">
            <div className="p-3 bg-orange/10 border border-orange/20 rounded-2xl text-orange shadow-sm animate-pulse">
              <Navigation className="w-8 h-8" />
            </div>
            <span>Tutores On-Demand</span>
          </h2>
          <p className="text-white/70 font-medium mt-3 text-lg">Encontra profissionais qualificados e solicita apoio no formato ride-hailing.</p>
        </div>

        {isTeacher ? (
          <button
            onClick={() => setShowEditProfile(!showEditProfile)}
            className="bg-orange text-lilac-dark px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange/80 shadow-[0_0_15px_rgba(255,107,0,0.35)] transition-all transform hover:-translate-y-0.5 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>{myProfile ? 'Editar Meu Perfil Tutor' : 'Criar Perfil Tutor'}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowApplyProfile(!showApplyProfile)}
            disabled={applicationStatus === 'pending'}
            className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5 text-sm shadow-[0_0_15px_rgba(255,107,0,0.25)] ${
              applicationStatus === 'pending'
                ? 'bg-lilac-dark/40 text-white/40 cursor-not-allowed border border-lilac-light/15'
                : 'bg-orange text-lilac-dark hover:bg-orange/85'
            }`}
          >
            {applicationStatus === 'pending' ? <Clock className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            <span>{applicationStatus === 'pending' ? 'Candidatura em Análise' : 'Quero ser Tutor'}</span>
          </button>
        )}
      </motion.div>

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

      {/* Application Form */}
      <AnimatePresence>
        {showApplyProfile && !isTeacher && applicationStatus !== 'pending' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-xl space-y-8 relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl -z-10"></div>
            <h3 className="text-2xl font-black text-white flex items-center gap-2 font-title">
              <ShieldCheck className="w-6 h-6 text-orange" />
              <span>Candidatura a Tutor APROVEI</span>
            </h3>
            <p className="text-white/70 font-medium mb-6">
              Junta-te à rede de excelência. Submete os teus dados e o teu currículo/histórico escolar. A nossa equipa pedagógica irá validar o teu perfil.
            </p>
            <form onSubmit={handleApplicationSubmit} className="grid gap-6 md:grid-cols-2 relative z-10">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Especialidade Principal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Matemática, Física, Inglês"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Anos de Experiência</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Ex: 2"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Anexar CV ou Histórico Escolar (PDF)</label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  className="w-full p-2 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm bg-lilac-dark/55 transition-all cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-orange/10 file:text-orange hover:file:bg-orange/20 text-white"
                  onChange={e => setCvFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyProfile(false)}
                  className="px-6 py-3 border border-lilac-light/25 text-white/60 hover:text-white rounded-xl text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-orange text-lilac-dark rounded-xl text-sm font-bold hover:bg-orange/80 shadow-sm hover:shadow-md transition-all disabled:opacity-70"
                >
                  {loading ? "Processando..." : "Submeter Candidatura"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Form */}
      <AnimatePresence>
        {showEditProfile && isTeacher && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-xl space-y-8 relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl -z-10"></div>
            <h3 className="text-2xl font-black text-white flex items-center gap-2 font-title">
              <Save className="w-6 h-6 text-orange" />
              <span>Configurar Perfil de Explicador</span>
            </h3>
            <form onSubmit={handleProfileSubmit} className="grid gap-6 md:grid-cols-2 relative z-10">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Especialidade / Disciplinas</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Explicador de Álgebra"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                  value={profileData.specialty}
                  onChange={e => setProfileData({ ...profileData, specialty: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Preço por Hora (Kz)</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                  value={profileData.price_per_hour}
                  onChange={e => setProfileData({ ...profileData, price_per_hour: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Contacto WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 244923000000"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                  value={profileData.whatsapp}
                  onChange={e => setProfileData({ ...profileData, whatsapp: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Localização</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Luanda, Talatona"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                  value={profileData.location}
                  onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Palavras-chave</label>
                <input
                  type="text"
                  placeholder="Ex: Matemática, Física, Análise Combinatória"
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all text-white font-semibold shadow-sm placeholder:text-white/30"
                  value={profileData.subject_tags}
                  onChange={e => setProfileData({ ...profileData, subject_tags: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Biografia</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreve um pouco sobre a tua experiência pedagógica..."
                  className="w-full px-4 py-3 bg-lilac-dark/55 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none text-sm transition-all resize-none text-white font-semibold shadow-sm placeholder:text-white/30"
                  value={profileData.bio}
                  onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-6 py-3 border border-lilac-light/25 text-white/60 hover:text-white rounded-xl text-sm font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-orange text-lilac-dark rounded-xl text-sm font-bold hover:bg-orange/80 shadow-sm hover:shadow-md transition-all disabled:opacity-70"
                >
                  {loading ? "Processando..." : "Salvar Perfil"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar / Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-sm grid gap-4 md:grid-cols-3 items-center relative z-10 p-6 text-left"
      >
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
          <input
            type="text"
            name="specialty"
            placeholder="Pesquisar matéria/especialidade..."
            className="w-full pl-10 pr-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold outline-none transition-all shadow-sm text-white placeholder:text-white/35"
            value={filters.specialty}
            onChange={handleFilterChange}
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
          <input
            type="text"
            name="location"
            placeholder="Província ou município..."
            className="w-full pl-10 pr-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold outline-none transition-all shadow-sm text-white placeholder:text-white/35"
            value={filters.location}
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <select
            name="max_price"
            className="w-full px-4 py-3 bg-lilac-dark/60 border border-lilac-light/20 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 text-sm font-semibold outline-none cursor-pointer transition-all shadow-sm appearance-none text-white"
            value={filters.max_price}
            onChange={handleFilterChange}
          >
            <option value="" className="bg-lilac-dark text-white">Qualquer Preço</option>
            <option value="2000" className="bg-lilac-dark text-white">Até 2.000 Kz/hora</option>
            <option value="4000" className="bg-lilac-dark text-white">Até 4.000 Kz/hora</option>
            <option value="6000" className="bg-lilac-dark text-white">Até 6.000 Kz/hora</option>
            <option value="10000" className="bg-lilac-dark text-white">Até 10.000 Kz/hora</option>
          </select>
        </div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-0 mt-8 mb-4 border border-lilac-light/20 rounded-[2rem] overflow-hidden shadow-md"
      >
        <MapComponent teachers={teachers.map((t: any, i) => ({
          id: t.id || i,
          name: t.user?.full_name || 'Explicador Aprovei',
          specialty: t.specialty || 'Apoio Geral',
          lat: -8.839988 + (Math.random() * 0.1 - 0.05),
          lng: 13.289437 + (Math.random() * 0.1 - 0.05)
        }))} />
      </motion.div>

      {/* Grid List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {teachers.length === 0 ? (
          <motion.div variants={itemVariants} className="md:col-span-full text-center py-24 card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-sm space-y-6">
            <div className="w-20 h-20 bg-lilac-dark/50 border border-lilac-light/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Users className="w-10 h-10 text-white/50" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-title">Nenhum tutor disponível</h3>
              <p className="text-white/60 font-medium max-w-sm mx-auto mt-2">
                Tenta limpar os filtros ou pesquisar noutra localização.
              </p>
            </div>
          </motion.div>
        ) : (
          teachers.map((teacher: any) => {
            const bState = bookingStates[teacher.id] || 'idle';

            return (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -8 }}
                key={teacher.id} 
                className="card-lilac-glass border-lilac-light/30 bg-lilac-base/20 shadow-sm hover:border-orange/40 transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group p-8 text-left"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange/5 rounded-full group-hover:scale-150 transition-transform duration-700 blur-2xl"></div>
                
                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-orange transition-colors font-title">
                        {teacher.user?.full_name || 'Explicador Aprovei'}
                      </h3>
                      <p className="text-sm text-orange font-bold mt-1">{teacher.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-400 text-lilac-dark px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{Number(teacher.rating).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-white/40 shrink-0" />
                    <span>{teacher.location || 'Angola'}</span>
                  </div>

                  {teacher.subject_tags && (
                    <div className="flex flex-wrap gap-2">
                      {teacher.subject_tags.split(',').map((tag: string, i: number) => (
                        <span key={i} className="bg-lilac-dark/60 border border-lilac-light/20 text-white/80 text-xs px-2.5 py-1 rounded-lg font-bold shadow-sm">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-white/70 text-sm leading-relaxed line-clamp-3 font-medium">
                    {teacher.bio}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-5 flex flex-col gap-4 relative z-10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Tarifa Base</p>
                      <p className="text-2xl font-black text-white font-title">
                        {teacher.price_per_hour.toLocaleString()} <span className="text-sm text-white/55 font-bold">Kz</span>
                      </p>
                    </div>
                    {bState === 'paid' && (
                      <div className="flex items-center gap-1 text-orange text-xs font-bold bg-orange/10 px-2 py-1 rounded-lg border border-orange/25">
                        <ShieldCheck className="w-4 h-4" /> Validado
                      </div>
                    )}
                  </div>

                  {/* Ride-Hailing Booking Flow UI */}
                  {bState === 'idle' && (
                    <button
                      onClick={() => handleBookingRequest(teacher.id)}
                      className="w-full bg-orange text-lilac-dark px-5 py-3.5 rounded-xl text-sm font-black shadow-sm hover:bg-orange/80 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-[0_0_15px_rgba(255,107,0,0.35)]"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Solicitar Tutor Agora</span>
                    </button>
                  )}

                  {bState === 'requested' && (
                    <button
                      disabled
                      className="w-full bg-lilac-dark/40 text-white/50 px-5 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-wait border border-lilac-light/20 shadow-inner"
                    >
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Aguardar Confirmação...</span>
                    </button>
                  )}

                  {bState === 'accepted' && (
                    <button
                      onClick={() => handlePayment(teacher.id)}
                      className="w-full bg-green-500 text-lilac-dark px-5 py-3.5 rounded-xl text-sm font-bold shadow-sm hover:bg-green-400 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 shadow-md"
                    >
                      <span>Pagar {teacher.price_per_hour.toLocaleString()} Kz</span>
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  {bState === 'paid' && (
                    <motion.a
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      href={`https://wa.me/${teacher.whatsapp?.replace(/\D/g, '') || ''}?text=Olá%20professor,%20vi%20o%20seu%20perfil%20no%20APROVEI%20e%20gostaria%20de%20saber%20mais%20sobre%20as%20suas%20explicações.`}
                      target="_blank"
                      className="w-full bg-[#25D366] text-white px-5 py-3.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Abrir WhatsApp</span>
                    </motion.a>
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
