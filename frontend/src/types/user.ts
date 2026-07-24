import type { Role } from "./role";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  last_login_at: string | null;
  created_at: string;
  two_factor_enabled: boolean;
}
