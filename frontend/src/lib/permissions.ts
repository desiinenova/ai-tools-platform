import type { AuthUser, Tool } from "@/types";

/**
 * Authorization rules, kept separate from session/identity (useCurrentUser).
 * These mirror the corresponding Laravel Policy methods (ToolPolicy::update /
 * ::delete) so the UI can hide actions the API would reject — the API is
 * still the enforcement point, this is presentation-only.
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
