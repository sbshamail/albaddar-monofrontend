"use client";

import { X } from "lucide-react";

import {
  BackgroundValue,
  backgroundToCss,
  parseBackground,
} from "../../lib/gradient";
import { cn } from "../../lib/utils";

const DEFAULT_SOLID = "#e11d48";
const DEFAULT_LINEAR: Extract<BackgroundValue, { kind: "linear" }> = {
  kind: "linear",
  angle: 135,
  stops: [
    { color: "#e11d48", position: 0 },
    { color: "#7c3aed", position: 100 },
  ],
};

const DEFAULT_PRESETS = [
  "linear-gradient(135deg, #f97316 0%, #e11d48 100%)",
  "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  "linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
  "linear-gradient(135deg, #fde68a 0%, #fca5a5 100%)",
  "linear-gradient(135deg, #1f2937 0%, #4b5563 100%)",
  "#111827",
  "#f1f5f9",
];

type Mode = "none" | "solid" | "linear";

const MODES: { value: Mode; label: string }[] = [
  { value: "none", label: "Default" },
  { value: "solid", label: "Solid" },
  { value: "linear", label: "Gradient" },
];

/**
 * Background picker — none / solid colour / two-stop linear gradient, with
 * presets. Controlled by a plain CSS string (see lib/gradient.ts), so the
 * value can be stored as-is and applied with `style={{ background }}`.
 * `null` means "no custom background" — the consumer falls back to its own
 * default (e.g. a theme `bg-card`). Domain-agnostic, reusable anywhere.
 */
export default function GradientPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  noneLabel = "Default",
  className,
}: {
  value: string | null;
  onChange: (css: string | null) => void;
  presets?: string[];
  /** Describes what "no custom background" falls back to. */
  noneLabel?: string;
  className?: string;
}) {
  const parsed = parseBackground(value);
  const mode: Mode = parsed?.kind ?? "none";

  const emit = (next: BackgroundValue | null) =>
    onChange(next ? backgroundToCss(next) : null);

  const setMode = (next: Mode) => {
    if (next === mode) return;
    if (next === "none") return emit(null);
    if (next === "solid") {
      // Keep the gradient's first colour when switching, so it isn't a reset.
      const color =
        parsed?.kind === "linear" ? parsed.stops[0].color : DEFAULT_SOLID;
      return emit({ kind: "solid", color });
    }
    // → gradient: start from the solid colour if there was one.
    const [from, to] = DEFAULT_LINEAR.stops;
    emit({
      ...DEFAULT_LINEAR,
      stops: [parsed?.kind === "solid" ? { ...from, color: parsed.color } : from, to],
    });
  };

  const setStopColor = (index: 0 | 1, color: string) => {
    if (parsed?.kind !== "linear") return;
    const stops = [...parsed.stops] as typeof parsed.stops;
    stops[index] = { ...stops[index], color };
    emit({ ...parsed, stops });
  };

  const setStopPosition = (index: 0 | 1, position: number) => {
    if (parsed?.kind !== "linear") return;
    const stops = [...parsed.stops] as typeof parsed.stops;
    stops[index] = { ...stops[index], position };
    emit({ ...parsed, stops });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview */}
      <div className="flex items-center gap-2">
        <div
          aria-label="Background preview"
          className={cn(
            "h-10 flex-1 rounded-md border border-input",
            !parsed && "bg-card",
          )}
          style={parsed ? { background: backgroundToCss(parsed) } : undefined}
        >
          {!parsed && (
            <span className="flex h-full items-center px-3 text-xs text-muted-foreground">
              {noneLabel}
            </span>
          )}
        </div>
        {parsed && (
          <button
            type="button"
            aria-label="Clear background"
            onClick={() => emit(null)}
            className="flex size-8 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Mode */}
      <div
        role="radiogroup"
        aria-label="Background type"
        className="inline-flex rounded-md border border-input p-0.5"
      >
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={mode === m.value}
            onClick={() => setMode(m.value)}
            className={cn(
              "rounded px-3 py-1 text-xs font-medium",
              mode === m.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {parsed?.kind === "solid" && (
        <ColorField
          label="Colour"
          color={parsed.color}
          onChange={(color) => emit({ kind: "solid", color })}
        />
      )}

      {parsed?.kind === "linear" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <ColorField
              label="From"
              color={parsed.stops[0].color}
              onChange={(c) => setStopColor(0, c)}
            />
            <ColorField
              label="To"
              color={parsed.stops[1].color}
              onChange={(c) => setStopColor(1, c)}
            />
          </div>
          <RangeField
            label="Angle"
            unit="°"
            min={0}
            max={360}
            step={15}
            value={parsed.angle}
            onChange={(angle) => emit({ ...parsed, angle })}
          />
          <div className="grid grid-cols-2 gap-3">
            <RangeField
              label="From stop"
              unit="%"
              min={0}
              max={100}
              step={5}
              value={parsed.stops[0].position}
              onChange={(p) => setStopPosition(0, p)}
            />
            <RangeField
              label="To stop"
              unit="%"
              min={0}
              max={100}
              step={5}
              value={parsed.stops[1].position}
              onChange={(p) => setStopPosition(1, p)}
            />
          </div>
        </div>
      )}

      {/* Presets */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Presets">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              aria-label={`Use preset ${preset}`}
              onClick={() => onChange(preset)}
              className={cn(
                "size-7 rounded-full border border-input shadow-xs transition-transform hover:scale-110",
                value === preset && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
              style={{ background: preset }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ColorField({
  label,
  color,
  onChange,
}: {
  label: string;
  color: string;
  onChange: (color: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
      />
      <span className="flex flex-col">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-mono uppercase">{color}</span>
      </span>
    </label>
  );
}

function RangeField({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1 text-xs">
      <span className="flex justify-between">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}
