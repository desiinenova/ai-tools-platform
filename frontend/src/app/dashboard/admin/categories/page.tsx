"use client";

import { EntityManager } from "@/components/admin/EntityManager";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/hooks/useCategories";

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  return (
    <EntityManager
      entityLabel="category"
      items={categories}
      isLoading={isLoading}
      isMutating={createCategory.isPending || updateCategory.isPending}
      onCreate={(name) => createCategory.mutateAsync({ name })}
      onUpdate={(id, name) => updateCategory.mutateAsync({ id, input: { name } })}
      onDelete={(id) => deleteCategory.mutateAsync(id)}
    />
  );
}
