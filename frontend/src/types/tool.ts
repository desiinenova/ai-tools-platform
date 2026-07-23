import type { Category } from "./category";
import type { Role } from "./role";
import type { Tag } from "./tag";

/** Read model — mirrors ToolResource exactly. */
export interface Tool {
  id: number;
  name: string;
  website_url: string;
  documentation_url: string | null;
  description: string;
  how_to_use: string | null;
  examples: string | null;
  image_url: string | null;
  created_by: number | null;
  creator?: { id: number; name: string };
  categories: Category[];
  roles: Role[];
  tags: Tag[];
  created_at: string;
  updated_at: string;
}

/**
 * Form/API input model. Intentionally not derived from Tool (e.g. via
 * Partial/Omit) — it isn't a partial read model, it's a different shape:
 * id arrays instead of nested objects, and a raw File the API accepts on
 * write but never returns.
 */
export interface ToolInput {
  name: string;
  website_url: string;
  documentation_url?: string;
  description: string;
  how_to_use?: string;
  examples?: string;
  category_ids: number[];
  role_ids: number[];
  tag_ids: number[];
  image?: File;
}

export interface ToolFilters {
  category_id?: number;
  role_id?: number;
  name?: string;
  tag_ids?: number[];
}
