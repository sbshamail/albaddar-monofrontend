// Background colour/gradient values, stored as a plain CSS string so they can
// go straight into `style={{ background }}` anywhere — a solid `#rrggbb` or a
// two-stop `linear-gradient(135deg, #rrggbb 0%, #rrggbb 100%)`. Only these two
// exact shapes are produced and accepted (the backend validates the same
// patterns), which is what makes it safe to put into an inline style.

export interface GradientStop {
  color: string;
  position: number;
}

export type BackgroundValue =
  | { kind: "solid"; color: string }
  | {
      kind: "linear";
      angle: number;
      stops: [GradientStop, GradientStop];
    };

const HEX = "#[0-9a-fA-F]{6}";
const SOLID_RE = new RegExp(`^(${HEX})$`);
const LINEAR_RE = new RegExp(
  `^linear-gradient\\((\\d{1,3})deg, (${HEX}) (\\d{1,3})%, (${HEX}) (\\d{1,3})%\\)$`,
);

/** CSS string → structured value, or null for empty/unrecognised input. */
export function parseBackground(
  css: string | null | undefined,
): BackgroundValue | null {
  const value = css?.trim();
  if (!value) return null;

  const solid = SOLID_RE.exec(value);
  if (solid) return { kind: "solid", color: solid[1].toLowerCase() };

  const m = LINEAR_RE.exec(value);
  if (m) {
    return {
      kind: "linear",
      angle: Number(m[1]),
      stops: [
        { color: m[2].toLowerCase(), position: Number(m[3]) },
        { color: m[4].toLowerCase(), position: Number(m[5]) },
      ],
    };
  }
  return null;
}

export function backgroundToCss(value: BackgroundValue): string {
  if (value.kind === "solid") return value.color.toLowerCase();
  const [a, b] = value.stops;
  return `linear-gradient(${Math.round(value.angle)}deg, ${a.color.toLowerCase()} ${Math.round(a.position)}%, ${b.color.toLowerCase()} ${Math.round(b.position)}%)`;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Which text colour stays readable on this background: "light" (white-ish)
 * on dark backgrounds, "dark" on light ones. Averages a gradient's stops.
 * null (no custom background) returns null — the caller's theme decides.
 */
export function readableTextOn(
  css: string | null | undefined,
): "light" | "dark" | null {
  const value = parseBackground(css);
  if (!value) return null;
  const colors =
    value.kind === "solid" ? [value.color] : value.stops.map((s) => s.color);
  const avg = colors.reduce((sum, c) => sum + luminance(c), 0) / colors.length;
  // 0.179 is the luminance where black and white text have equal contrast.
  return avg > 0.179 ? "dark" : "light";
}
