// Per Next.js's own parallel-routes docs: a client-side (soft) navigation to
// a path with no matching @modal route leaves the slot's last content
// visible — default.tsx only applies to hard navigation/refresh. This
// catch-all is what actually closes any open modal (login, checkout,
// product quick-view) when the user navigates anywhere else via a Link —
// without it, "View full details" (and any other link out of an open
// modal) updates the URL but leaves the modal rendered on top of it.
export default function ModalCatchAll() {
  return null;
}
