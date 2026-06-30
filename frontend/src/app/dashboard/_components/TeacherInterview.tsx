"use client";
import React, { useState } from 'react';
import { Award, FileText } from 'lucide-react';
import api from '@/lib/api';

export default function TeacherInterview({ user, onComplete }: { user: any; onComplete: (user: any) => void }) {
  const [formData, setFormData] = useState({
    specialty: '',
    bio: '',
    price_per_hour: '',
    location: '',
    whatsapp: '',
    subject_tags: '',
    experience: '',
    years_of_experience: '',
    what_intends: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Deve anexar o seu Currículo em formato PDF.');
      return;
    }
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('specialty', formData.specialty);
    data.append('bio', formData.bio);
    data.append('price_per_hour', formData.price_per_hour);
    data.append('location', formData.location);
    data.append('whatsapp', formData.whatsapp);
    data.append('subject_tags', formData.subject_tags);
    data.append('experience', formData.experience);
    data.append('years_of_experience', formData.years_of_experience);
    data.append('what_intends', formData.what_intends);
    data.append('resume', resumeFile);

    try {
      const res = await api.post('/teachers/apply', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const updatedUser = { ...user, status: res.data.status };
      onComplete(updatedUser);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao submeter a candidatura. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20 text-left font-sans">
      <div className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-bl-full pointer-events-none"></div>
        <h2 className="text-3xl font-black text-white flex items-center gap-2">
          <Award className="w-8 h-8 text-orange" />
          <span>Entrevista de Explicador Online</span>
        </h2>
        <p className="text-white/60 mt-2 font-medium">
          Preenche com detalhe e anexa o teu currículo. Esta será a tua <strong>única oportunidade</strong> de candidatura técnico-pedagógica.
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-rose-400 bg-rose-950/40 rounded-2xl border border-rose-800/40 font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-lilac-dark/45 border border-white/10 p-8 rounded-[2rem] backdrop-blur-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Cadeira / Especialidade Principal</label>
            <input
              type="text"
              required
              placeholder="Ex: Álgebra e Geometria Plana"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.specialty}
              onChange={e => setFormData({ ...formData, specialty: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Preço Pretendido / Hora (Kz)</label>
            <input
              type="number"
              required
              placeholder="Ex: 5000"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.price_per_hour}
              onChange={e => setFormData({ ...formData, price_per_hour: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Província e Município</label>
            <input
              type="text"
              required
              placeholder="Ex: Luanda, Talatona"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Link WhatsApp ou Telemóvel</label>
            <input
              type="text"
              required
              placeholder="Ex: https://wa.me/244923000000"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.whatsapp}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/60 ml-1 uppercase">Disciplinas Adicionais (Separadas por vírgula)</label>
          <input
            type="text"
            required
            placeholder="Ex: Matemática, Física, Análise Matemática"
            className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
            value={formData.subject_tags}
            onChange={e => setFormData({ ...formData, subject_tags: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/60 ml-1 uppercase">Apresentação / Biografia Rápida</label>
          <textarea
            required
            rows={3}
            placeholder="Escreve uma curta bio sobre ti para atrair estudantes..."
            className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/60 ml-1 uppercase">Experiência Profissional e de Docência (Completa)</label>
          <textarea
            required
            rows={3}
            placeholder="Onde lecionaste? Quais cargos ocupaste?"
            className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
            value={formData.experience}
            onChange={e => setFormData({ ...formData, experience: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Anos de Experiência Didática</label>
            <input
              type="number"
              required
              placeholder="Ex: 3"
              className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
              value={formData.years_of_experience}
              onChange={e => setFormData({ ...formData, years_of_experience: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 ml-1 uppercase">Currículo Vitae (Apenas PDF)</label>
            <input
              type="file"
              required
              accept="application/pdf"
              className="w-full px-4 py-3 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none text-sm focus:border-orange/50"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setResumeFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-white/60 ml-1 uppercase">O que pretendes alcançar como Explicador da Aprovei?</label>
          <textarea
            required
            rows={3}
            placeholder="Quais são as tuas metas pedagógicas e como podes motivar os teus futuros alunos?"
            className="w-full px-4 py-3.5 bg-lilac-dark/50 border border-lilac-light/20 rounded-2xl text-white outline-none focus:border-orange/50"
            value={formData.what_intends}
            onChange={e => setFormData({ ...formData, what_intends: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-orange py-4 font-black text-lg text-lilac-dark rounded-2xl hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Submetendo Candidatura..." : "Submeter Candidatura"}
        </button>
      </form>
    </div>
  );
}
