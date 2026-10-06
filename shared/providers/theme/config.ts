export const THEME_COOKIE = "ui-theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type ThemeMode = "light" | "dark";

/**
 * Single source of truth for available color themes.
 * To add a new one:
 *  1. Add an entry here (value + swatch used for a future theme-switcher UI)
 *  2. Add matching `[data-color="value"]` and `.dark[data-color="value"]`
 *     blocks in app/globals.css with the overridden CSS vars
 */
export const THEME_COLORS = [
  { value: "neutral", label: "Neutral", swatch: "oklch(0.205 0 0)" },
  { value: "pink", label: "Pink", swatch: "oklch(0.525 0.223 3.958)" },
  { value: "green", label: "Green", swatch: "oklch(0.527 0.154 150.069)" },
] as const;

export type ThemeColor = (typeof THEME_COLORS)[number]["value"];

export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
  radius: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  mode: "light",
  color: "green",
  radius: "0.625rem",
};

const VALID_MODES: ThemeMode[] = ["light", "dark"];
const VALID_COLORS = THEME_COLORS.map((c) => c.value) as ThemeColor[];

export function parseThemeCookie(raw: string | undefined): ThemeConfig {
  if (!raw) return DEFAULT_THEME;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return {
      mode: VALID_MODES.includes(parsed.mode)
        ? parsed.mode
        : DEFAULT_THEME.mode,
      color: VALID_COLORS.includes(parsed.color)
        ? parsed.color
        : DEFAULT_THEME.color,
      radius:
        typeof parsed.radius === "string"
          ? parsed.radius
          : DEFAULT_THEME.radius,
    };
  } catch {
    return DEFAULT_THEME;
  }
}
