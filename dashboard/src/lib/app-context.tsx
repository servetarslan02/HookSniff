'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './store';
import { applicationsApi, type Application } from './api';

interface AppContextType {
  applications: Application[];
  selectedAppId: string | null;
  selectedApp: Application | null;
  setSelectedAppId: (id: string | null) => void;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'hooksniff_selected_app';

export function AppProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setSelectedAppId = useCallback((id: string | null) => {
    setSelectedAppIdState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const apps = await applicationsApi.list(token);
      const list = Array.isArray(apps) ? apps : [];
      setApplications(list);

      // Restore selection or auto-select first app
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && list.some((a: Application) => a.id === stored)) {
        setSelectedAppIdState(stored);
      } else if (list.length > 0) {
        setSelectedAppIdState(list[0].id);
        localStorage.setItem(STORAGE_KEY, list[0].id);
      }
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) refresh();
    else setIsLoading(false);
  }, [token, refresh]);

  const selectedApp = applications.find((a) => a.id === selectedAppId) || null;

  return (
    <AppContext.Provider value={{ applications, selectedAppId, selectedApp, setSelectedAppId, isLoading, refresh }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
