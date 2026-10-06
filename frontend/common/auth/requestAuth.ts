// Lets any component (a product card, the cart page, wherever) trigger the
// login modal and resume whatever it was doing once the user signs in —
// without prop-drilling a callback through the modal's own route tree.
// Same "module-level singleton bridge" shape as shared/providers/LoaderContext.tsx.

let pendingAction: (() => void) | null = null;

/** Navigate to the login modal, remembering what to do after a successful
 * verify. Call from a client component with access to `useRouter()`. */
export function requestAuth(
  router: { push: (href: string) => void },
  onSuccess?: () => void,
) {
  pendingAction = onSuccess ?? null;
  
  router.push("/login");
}

/** Called by AuthModal right after a successful OTP verify. */
export function resolvePendingAuth() {
  const action = pendingAction;
  pendingAction = null;
  action?.();
}
