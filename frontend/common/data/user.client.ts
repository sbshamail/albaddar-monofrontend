import { fetching } from "@deep-ecommerce/shared/api/client";
import { AuthUser } from "@/types/auth_types";

/** PUT /user/update is form-encoded on the backend (UserUpdateForm), not
 * JSON — OTP registration never collects full_name/phone, so this is how
 * the checkout form (and later, the settings page) fills them in. */
export async function updateProfile(fields: {
  full_name?: string;
  phone?: string;
}): Promise<AuthUser | null> {
  const res = await fetching<AuthUser>({
    url: "/api/user/update",
    method: "PUT",
    isFormdata: true,
    body: fields,
  });
  return res.ok ? (res.data ?? null) : null;
}
