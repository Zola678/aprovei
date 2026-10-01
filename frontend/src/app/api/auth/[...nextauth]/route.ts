import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "aprovei_nextauth_fallback_secret_production_2026_safe_key",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "google-client-id-placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret-placeholder",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "github-id-placeholder",
      clientSecret: process.env.GITHUB_SECRET || "github-secret-placeholder",
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        try {
          const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
          const baseUrl = rawApiUrl.replace(/\/api\/v1\/?$/, '');
          const res = await fetch(`${baseUrl}/api/v1/auth/social-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: account.provider,
              token: account.provider === 'google' ? account.id_token : account.access_token,
              role: 'student'
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.access_token;
            token.user = data.user;
          }
        } catch (error) {
          console.error("Erro na comunicação com backend:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        (session as any).accessToken = token.accessToken;
        session.user = token.user as any;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
