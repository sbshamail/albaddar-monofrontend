'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  DEFAULT_THEME,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  ThemeColor,
  ThemeConfig,
  ThemeMode,
} from './config';

// ─── Context ─────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  mode: ThemeMode;
  color: ThemeColor;
  radius: string;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  setRadius: (radius: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function saveCookie(config: ThemeConfig): void {
  document.cookie = [
    `${THEME_COOKIE}=${encodeURIComponent(JSON.stringify(config))}`,
    'path=/',
    `max-age=${THEME_COOKIE_MAX_AGE}`,
    'samesite=lax',
  ].join('; ');
}

function applyToDOM(config: ThemeConfig): void {
  const root = document.documentElement;

  // Dark / light mode class
  root.classList.remove('dark', 'light');
  root.classList.add(config.mode);

  // Color theme via data attribute — all color vars live in CSS
  if (config.color === 'neutral') {
    root.removeAttribute('data-color');
  } else {
    root.setAttribute('data-color', config.color);
  }

  // Radius is the only value still set inline (it's a continuous scale)
  root.style.setProperty('--radius', config.radius);
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
  /** Initial config resolved server-side from the theme cookie. */
  initial?: ThemeConfig;
}

const ThemeProvider = ({ children, initial = DEFAULT_THEME }: Props) => {
  const [config, setConfig] = useState<ThemeConfig>(initial);

  const update = useCallback((next: ThemeConfig) => {
    applyToDOM(next);
    saveCookie(next);
    setConfig(next);
  }, []);

  const toggleMode = useCallback(
    () => update({ ...config, mode: config.mode === 'dark' ? 'light' : 'dark' }),
    [update, config],
  );

  const setMode = useCallback(
    (mode: ThemeMode) => update({ ...config, mode }),
    [update, config],
  );

  const setColor = useCallback(
    (color: ThemeColor) => update({ ...config, color }),
    [update, config],
  );

  const setRadius = useCallback(
    (radius: string) => update({ ...config, radius }),
    [update, config],
  );

  return (
    <ThemeContext.Provider value={{ ...config, toggleMode, setMode, setColor, setRadius }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
export default ThemeProvider;
