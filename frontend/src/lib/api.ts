import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStorageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  // Remove o sufixo /api/v1 ou /api para obter a URL base do backend
  const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${baseUrl}/${cleanPath}`;
};

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
