import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  let token: string | null = null;

  if (typeof window !== 'undefined') {
    // Tenta obter o token da sessão NextAuth primeiro
    try {
      const session: any = await getSession();
      if (session?.accessToken) {
        token = session.accessToken;
      }
    } catch (error) {
      // Ignorar erros caso getSession falhe (ex: contexto não-browser)
    }

    // Fallback: se não usar OAuth, tenta buscar do localStorage
    if (!token) {
      token = localStorage.getItem('token');
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
