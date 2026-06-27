import "@/styles/globals.css";
import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import SessionProviderWrapper from "../components/SessionProviderWrapper";
import { ModuleProvider } from "@/context/ModuleContext";
import SessionLayoutWrapper from "../components/SessionLayoutWrapper";


export const metadata: Metadata = {
  title: "APROVEI | A Tua Aprovação Começa Aqui",
  description: "Plataforma líder na preparação para exames de acesso universitário em Angola.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO" className="scroll-smooth bg-background">
      <body className="bg-background text-text font-sans selection:bg-primary/30 selection:text-white min-h-screen flex flex-col">
        <SessionProviderWrapper>
          <ModuleProvider>
            <Navbar />
            <main className="flex-grow w-full">
              <SessionLayoutWrapper>
                {children}
              </SessionLayoutWrapper>
            </main>
            <Footer />
          </ModuleProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}

