// Deliberately NOT in RichTextEditor.tsx itself: that file is "use client",
// and a "use client" module's exports become opaque client references when
// imported into a Server Component — a plain constant like this one would
// no longer be usable as a real string there. Kept in its own directive-free
// module so both the editor (client) and read-only HTML rendering of its
// output (e.g. a Server Component product-description block) can import the
// same value safely.
export const RICH_TEXT_CLASSNAME =
  "max-w-none " +
  "[&_p]:my-1 " +
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 " +
  "[&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_a]:underline [&_a]:text-primary " +
  // Tailwind's preflight resets every heading to `font-size: inherit;
  // font-weight: inherit` — restored explicitly here (same reason as the
  // list styles above), same scale in both the editor and wherever this
  // HTML is rendered downstream (e.g. dangerouslySetInnerHTML on the
  // storefront), since both read this one constant.
  "[&_h1]:mt-3 [&_h1]:mb-1.5 [&_h1]:text-2xl [&_h1]:font-bold " +
  "[&_h2]:mt-3 [&_h2]:mb-1.5 [&_h2]:text-xl [&_h2]:font-bold " +
  "[&_h3]:mt-2.5 [&_h3]:mb-1 [&_h3]:text-lg [&_h3]:font-semibold " +
  "[&_h4]:mt-2.5 [&_h4]:mb-1 [&_h4]:text-base [&_h4]:font-semibold " +
  "[&_h5]:mt-2 [&_h5]:mb-1 [&_h5]:text-sm [&_h5]:font-semibold " +
  "[&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:text-xs [&_h6]:font-semibold " +
  // Inline code (the toolbar's Code button) — monospace + a subtle
  // background so it reads as code rather than plain emphasis.
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]";
