// lucide-react has no brand logos (it's a generic icon set), so the actual
// WhatsApp glyph is a plain inline SVG rather than an icon-library import —
// no new dependency just for one brand mark.
export default function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.94.56 3.75 1.55 5.29L2 22l4.94-1.62a9.87 9.87 0 0 0 5.1 1.4h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.1c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.79-4.16-4.94-4.36-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.58-.36.78-.36.2 0 .39.002.56.01.18.008.42-.07.66.5.24.58.81 2 .89 2.15.07.14.12.31.02.5-.1.19-.15.3-.29.46-.14.16-.3.36-.42.48-.14.14-.29.29-.13.57.17.29.75 1.24 1.62 2 1.11.99 2.05 1.3 2.35 1.44.3.14.47.12.65-.07.18-.19.75-.87.95-1.17.2-.3.4-.25.66-.15.27.1 1.68.8 1.97.94.29.15.48.22.55.35.07.13.07.75-.17 1.44Z" />
    </svg>
  );
}
