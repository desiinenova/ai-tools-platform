"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Button } from "@/components/ui/Button";
import { useCategories } from "@/lib/hooks/useCategories";
import { useRoles } from "@/lib/hooks/useRoles";
import { useTags } from "@/lib/hooks/useTags";
import type { ToolFilters as ToolFiltersValue } from "@/types";

export interface ToolFiltersProps {
  filters: ToolFiltersValue;
  onFilterChange: (filters: ToolFiltersValue) => void;
}

const NAME_DEBOUNCE_MS = 400;
const ALL = "all";

export function ToolFilters({ filters, onFilterChange }: ToolFiltersProps) {
  const { data: categories } = useCategories();
  const { data: roles } = useRoles();
  const { data: tags } = useTags();

  const [nameInput, setNameInput] = useState(filters.name ?? "");

  // Keep the local input in sync when filters change from outside this
  // component (browser back/forward, "Clear filters", URL normalization).
  useEffect(() => {
    setNameInput(filters.name ?? "");
  }, [filters.name]);

  // Debounce: only propagate to the URL/query after the user pauses typing.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (nameInput !== (filters.name ?? "")) {
        onFilterChange({ ...filters, name: nameInput || undefined });
      }
    }, NAME_DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [nameInput, filters, onFilterChange]);

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex-1 sm:min-w-[200px]">
        <Input
          label="Search"
          placeholder="Search by name…"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
      </div>

      <div className="sm:w-48">
        <Select
          label="Category"
          options={[
            { value: ALL, label: "All categories" },
            ...(categories ?? []).map((c) => ({ value: String(c.id), label: c.name })),
          ]}
          value={filters.category_id ? String(filters.category_id) : ALL}
          onChange={(value) =>
            onFilterChange({
              ...filters,
              category_id: value === ALL ? undefined : Number(value),
            })
          }
        />
      </div>

      <div className="sm:w-48">
        <Select
          label="Role"
          options={[
            { value: ALL, label: "All roles" },
            ...(roles ?? []).map((r) => ({ value: String(r.id), label: r.name })),
          ]}
          value={filters.role_id ? String(filters.role_id) : ALL}
          onChange={(value) =>
            onFilterChange({
              ...filters,
              role_id: value === ALL ? undefined : Number(value),
            })
          }
        />
      </div>

      <div className="sm:w-56">
        <MultiSelect
          label="Tags"
          placeholder="All tags"
          options={(tags ?? []).map((t) => ({ value: String(t.id), label: t.name }))}
          selected={(filters.tag_ids ?? []).map(String)}
          onChange={(values) =>
            onFilterChange({
              ...filters,
              tag_ids: values.length > 0 ? values.map(Number) : undefined,
            })
          }
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => onFilterChange({})}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
