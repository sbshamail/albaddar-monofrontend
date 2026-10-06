// Same reasoning as common/whatsapp/WhatsAppIcon.tsx — lucide-react ships no
// brand logos, so the YouTube glyph is a plain inline SVG.
export default function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.117C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.524A2.994 2.994 0 0 0 .502 6.186 31.26 31.26 0 0 0 0 12a31.26 31.26 0 0 0 .502 5.814 2.994 2.994 0 0 0 2.112 2.117c1.881.524 9.386.524 9.386.524s7.505 0 9.386-.524a2.994 2.994 0 0 0 2.112-2.117A31.26 31.26 0 0 0 24 12a31.26 31.26 0 0 0-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z" />
    </svg>
  );
}
