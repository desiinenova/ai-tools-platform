import type { ToolFilters } from "@/types";

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseTagIds(value: string | null): number[] | undefined {
  if (!value) return undefined;

  const ids = Array.from(
    new Set(
      value
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  );

  return ids.length > 0 ? ids : undefined;
}

/**
 * Reads ToolFilters out of URL search params, silently dropping anything
 * malformed (non-numeric ids, negative/zero ids, garbage tag_ids entries,
 * unknown params) rather than passing bad data through to the API.
 */
export function parseToolFilters(searchParams: URLSearchParams): ToolFilters {
  const filters: ToolFilters = {};

  const categoryId = parsePositiveInt(searchParams.get("category_id"));
  if (categoryId !== undefined) filters.category_id = categoryId;

  const roleId = parsePositiveInt(searchParams.get("role_id"));
  if (roleId !== undefined) filters.role_id = roleId;

  const name = searchParams.get("name")?.trim();
  if (name) filters.name = name;

  const tagIds = parseTagIds(searchParams.get("tag_ids"));
  if (tagIds !== undefined) filters.tag_ids = tagIds;

  return filters;
}

/** Canonical serialization of ToolFilters — the inverse of parseToolFilters. */
export function serializeToolFilters(filters: ToolFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.category_id) params.set("category_id", String(filters.category_id));
  if (filters.role_id) params.set("role_id", String(filters.role_id));
  if (filters.name) params.set("name", filters.name);
  if (filters.tag_ids && filters.tag_ids.length > 0) {
    params.set("tag_ids", filters.tag_ids.join(","));
  }

  return params;
}
