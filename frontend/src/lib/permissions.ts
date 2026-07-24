import type { AuthUser, Tool } from "@/types";

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

export function canEditTool(
  user: AuthUser | null | undefined,
  tool: Pick<Tool, "created_by">,
): boolean {
  if (!user) return false;
  return isOwner(user) || tool.created_by === user.id;
}

// Same rule as canEditTool today, kept as a distinct function since Policies
// will define edit/delete as separate abilities even where they coincide now.
export function canDeleteTool(
  user: AuthUser | null | undefined,
  tool: Pick<Tool, "created_by">,
): boolean {
  return canEditTool(user, tool);
}
