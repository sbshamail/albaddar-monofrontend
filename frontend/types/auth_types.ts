// Mirrors backend UserRead (src/api/models/userModel.py) — customer-relevant
// fields only. Kept frontend-local per shared/AGENTS.md (auth types stay
// app-local, not shared with admin).
export interface AuthUser {
  id: number;
  full_name: string | null;
  phone: string | null;
  email: string;
  email_verified: boolean;
  verified: boolean;
  image: { original: string; thumbnail: string | null } | null;
  country: string | null;
  country_code: string | null;
}

export interface OtpVerifyResponseData {
  message: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  exp: string;
}
