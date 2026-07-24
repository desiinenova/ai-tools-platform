"use client";

import { EntityManager } from "@/components/admin/EntityManager";
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from "@/lib/hooks/useTags";

export default function AdminTagsPage() {
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  return (
    <EntityManager
      entityLabel="tag"
      items={tags}
      isLoading={isLoading}
      isMutating={createTag.isPending || updateTag.isPending}
      onCreate={(name) => createTag.mutateAsync({ name })}
      onUpdate={(id, name) => updateTag.mutateAsync({ id, input: { name } })}
      onDelete={(id) => deleteTag.mutateAsync(id)}
    />
  );
}
