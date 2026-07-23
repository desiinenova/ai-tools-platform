import type { AuthUser } from "@/types";

/**
 * Authorization rules, kept separate from session/identity (useCurrentUser).
 * These are presentation-only today — the backend does not enforce them yet
 * (Day 4). Each function here is meant to map onto a future Laravel Policy
 * method of the same name, so the rule lives in exactly one place when that
 * mapping happens.
 */

export function hasRole(user: AuthUser | null | undefined, roles: string[]): boolean {
  return !!user && roles.includes(user.role.name);
}

export function isOwner(user: AuthUser | null | undefined): boolean {
  return hasRole(user, ["owner"]);
}
