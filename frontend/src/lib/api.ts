import type {
  AuthUser,
  Category,
  CategoryInput,
  HealthResponse,
  Role,
  Tag,
  TagInput,
  Tool,
  ToolFilters,
  ToolInput,
} from "@/types";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  // Without this, Laravel can't tell we're an API client and falls back to
  // its web behavior on auth failures (redirecting to a named route) instead
  // of returning a JSON error response.
  headers.set("Accept", "application/json");

  if (UNSAFE_METHODS.has(method)) {
    const token = getCookie("XSRF-TOKEN");
    if (token) {
      headers.set("X-XSRF-TOKEN", token);
    }
  }

  const res = await fetch(path, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// Laravel's JsonResource wraps single/collection responses in { data: ... }.
async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  return (await promise).data;
}

export function getHealth() {
  return apiFetch<HealthResponse>("/api/health");
}

export function getCsrfCookie() {
  return apiFetch<void>("/sanctum/csrf-cookie");
}

export async function login(email: string, password: string) {
  await getCsrfCookie();
  await apiFetch<void>("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return apiFetch<void>("/api/logout", { method: "POST" });
}

export function getCurrentUser() {
  return apiFetch<AuthUser>("/api/user");
}

export function listRoles() {
  return unwrap(apiFetch<{ data: Role[] }>("/api/roles"));
}

export function listCategories() {
  return unwrap(apiFetch<{ data: Category[] }>("/api/categories"));
}

function jsonBody(input: unknown): RequestInit {
  return { headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) };
}

export function createCategory(input: CategoryInput) {
  return unwrap(
    apiFetch<{ data: Category }>("/api/categories", { method: "POST", ...jsonBody(input) }),
  );
}

export function updateCategory(id: number, input: CategoryInput) {
  return unwrap(
    apiFetch<{ data: Category }>(`/api/categories/${id}`, { method: "PUT", ...jsonBody(input) }),
  );
}

export function deleteCategory(id: number) {
  return apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" });
}

export function listTags() {
  return unwrap(apiFetch<{ data: Tag[] }>("/api/tags"));
}

export function createTag(input: TagInput) {
  return unwrap(apiFetch<{ data: Tag }>("/api/tags", { method: "POST", ...jsonBody(input) }));
}

export function updateTag(id: number, input: TagInput) {
  return unwrap(apiFetch<{ data: Tag }>(`/api/tags/${id}`, { method: "PUT", ...jsonBody(input) }));
}

export function deleteTag(id: number) {
  return apiFetch<void>(`/api/tags/${id}`, { method: "DELETE" });
}

function buildToolsQuery(filters: ToolFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.category_id) params.set("category_id", String(filters.category_id));
  if (filters.role_id) params.set("role_id", String(filters.role_id));
  if (filters.name) params.set("name", filters.name);
  if (filters.status) params.set("status", filters.status);
  filters.tag_ids?.forEach((id) => params.append("tag_ids[]", String(id)));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function listTools(filters?: ToolFilters) {
  return unwrap(apiFetch<{ data: Tool[] }>(`/api/tools${buildToolsQuery(filters)}`));
}

export function getTool(id: number) {
  return unwrap(apiFetch<{ data: Tool }>(`/api/tools/${id}`));
}

function toolFormData(input: ToolInput): FormData {
  const formData = new FormData();

  formData.append("name", input.name);
  formData.append("website_url", input.website_url);
  if (input.documentation_url) formData.append("documentation_url", input.documentation_url);
  if (input.documentation_body) formData.append("documentation_body", input.documentation_body);
  formData.append("description", input.description);
  input.category_ids.forEach((id) => formData.append("category_ids[]", String(id)));
  input.role_ids.forEach((id) => formData.append("role_ids[]", String(id)));
  input.tag_ids.forEach((id) => formData.append("tag_ids[]", String(id)));
  if (input.image) formData.append("image", input.image);

  return formData;
}

export function createTool(input: ToolInput) {
  return unwrap(
    apiFetch<{ data: Tool }>("/api/tools", {
      method: "POST",
      body: toolFormData(input),
    }),
  );
}

export function updateTool(id: number, input: ToolInput) {
  // PHP doesn't populate $_FILES on a native PUT, so multipart updates that
  // include a file must POST with a spoofed method instead.
  const formData = toolFormData(input);
  formData.append("_method", "PUT");

  return unwrap(
    apiFetch<{ data: Tool }>(`/api/tools/${id}`, {
      method: "POST",
      body: formData,
    }),
  );
}

export function deleteTool(id: number) {
  return apiFetch<void>(`/api/tools/${id}`, { method: "DELETE" });
}

export function approveTool(id: number) {
  return unwrap(apiFetch<{ data: Tool }>(`/api/tools/${id}/approve`, { method: "PATCH" }));
}

export function rejectTool(id: number) {
  return unwrap(apiFetch<{ data: Tool }>(`/api/tools/${id}/reject`, { method: "PATCH" }));
}
