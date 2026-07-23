import type { Role } from "./role";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}
