/* ============================================
   ACME Logistics Dashboard — Custom Hooks
   ============================================ */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardData, ConnectionStatus } from '../types';

// ── API Configuration ──

const DEFAULT_API_URL = '';
const REFRESH_INTERVAL = 30000; // 30 seconds
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;

// ── useDashboardData Hook ──

interface UseDashboardDataOptions {
  apiUrl?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDashboardDataReturn {
  data: DashboardData | null;
  status: ConnectionStatus;
  error: string | null;
  refresh: () => Promise<void>;
  isLoading: boolean;
}

export function useDashboardData(options: UseDashboardDataOptions = {}): UseDashboardDataReturn {
  const {
    apiUrl = DEFAULT_API_URL,
    autoRefresh = true,
    refreshInterval = REFRESH_INTERVAL,
  } = options;

  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setStatus('connecting');
      
      const headers: HeadersInit = API_KEY ? { 'X-API-Key': API_KEY } : {};
      const response = await fetch(`${apiUrl}/api/v1/dashboard`, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const dashboardData: DashboardData = await response.json();
      
      setData(dashboardData);
      setStatus('connected');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && status === 'connected') {
      intervalRef.current = window.setInterval(fetchData, refreshInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchData, status]);

  return {
    data,
    status,
    error,
    refresh: fetchData,
    isLoading,
  };
}

// ── useGenerateDemoData Hook ──

interface UseGenerateDemoDataReturn {
  generate: (count?: number) => Promise<boolean>;
  isGenerating: boolean;
  error: string | null;
}

export function useGenerateDemoData(apiUrl = DEFAULT_API_URL): UseGenerateDemoDataReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (count = 10): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiUrl}/api/v1/demo/generate-calls?count=${count}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate demo data';
      setError(message);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [apiUrl]);

  return {
    generate,
    isGenerating,
    error,
  };
}

// ── useLocalStorage Hook ──

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key]);

  return [storedValue, setValue];
}

// ── useInterval Hook ──

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    
    return () => clearInterval(id);
  }, [delay]);
}
