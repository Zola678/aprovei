"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ModuleType = "high_school" | "university_access" | null;

interface ModuleContextType {
  activeModule: ModuleType;
  setActiveModule: (module: "high_school" | "university_access") => void;
  clearModuleSelection: () => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModuleState] = useState<ModuleType>(null);

  useEffect(() => {
    // Carrega a seleção salva no localStorage ou do perfil do utilizador logado
    const storedModule = localStorage.getItem("activeModule") as ModuleType;
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.educational_level === "high_school" || user.educational_level === "university_access") {
          setActiveModuleState(user.educational_level);
          return;
        }
      } catch (e) {
        console.error("Erro ao analisar utilizador para o módulo", e);
      }
    }

    if (storedModule === "high_school" || storedModule === "university_access") {
      setActiveModuleState(storedModule);
    }
  }, []);

  const setActiveModule = (module: "high_school" | "university_access") => {
    setActiveModuleState(module);
    localStorage.setItem("activeModule", module);
    
    // Se o utilizador estiver logado, atualiza também no objeto user local
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        user.educational_level = module;
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.error("Erro ao atualizar módulo no utilizador", e);
      }
    }
  };

  const clearModuleSelection = () => {
    setActiveModuleState(null);
    localStorage.removeItem("activeModule");
  };

  return (
    <ModuleContext.Provider value={{ activeModule, setActiveModule, clearModuleSelection }}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error("useModule deve ser usado dentro de um ModuleProvider");
  }
  return context;
}
