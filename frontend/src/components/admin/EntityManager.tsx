"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, Card, Input, Modal } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api";
import type { ValidationErrorBody } from "@/types";

export interface NamedEntity {
  id: number;
  name: string;
  tools_count: number;
}

export interface EntityManagerProps<T extends NamedEntity> {
  /** Singular, lowercase noun used in headings/messages, e.g. "category". */
  entityLabel: string;
  items: T[] | undefined;
  isLoading: boolean;
  isMutating: boolean;
  onCreate: (name: string) => Promise<unknown>;
  onUpdate: (id: number, name: string) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}

/**
 * Shared CRUD UI for simple `{ id, name }` taxonomy resources (Categories,
 * Tags). Both are managed identically, so this is one component rather than
 * two near-duplicates.
 */
export function EntityManager<T extends NamedEntity>({
  entityLabel,
  items,
  isLoading,
  isMutating,
  onCreate,
  onUpdate,
  onDelete,
}: EntityManagerProps<T>) {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setNameError(undefined);
    setFormOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    setName(item.name);
    setNameError(undefined);
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError(undefined);

    try {
      if (editing) {
        await onUpdate(editing.id, name);
        toast({ title: `${capitalize(entityLabel)} updated.`, variant: "success" });
      } else {
        await onCreate(name);
        toast({ title: `${capitalize(entityLabel)} created.`, variant: "success" });
      }
      setFormOpen(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as ValidationErrorBody;
        setNameError(body.errors?.name?.[0]);
      } else {
        toast({ title: "Something went wrong. Please try again.", variant: "error" });
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      await onDelete(deleteTarget.id);
      toast({ title: `${capitalize(entityLabel)} deleted.`, variant: "success" });
      setDeleteTarget(null);
    } catch {
      toast({ title: `Failed to delete ${entityLabel}.`, variant: "error" });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" aria-hidden />
          Add {entityLabel}
        </Button>
      </div>

      <Card className="flex flex-col gap-0 p-0">
        {isLoading && <p className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading…</p>}
        {!isLoading && (items?.length ?? 0) === 0 && (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400">No {entityLabel}s yet.</p>
        )}
        {items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-800"
          >
            <span className="text-sm text-gray-900 dark:text-gray-100">{item.name}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={`Edit ${item.name}`}
                onClick={() => openEdit(item)}
                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${item.name}`}
                onClick={() => setDeleteTarget(item)}
                className="rounded p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </Card>

      <Modal
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? `Edit ${entityLabel}` : `Add ${entityLabel}`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isMutating}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${entityLabel} "${deleteTarget?.name ?? ""}"?`}
        description={deleteTarget ? deleteDescription(entityLabel, deleteTarget) : undefined}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function deleteDescription(entityLabel: string, item: NamedEntity): string {
  if (item.tools_count === 0) {
    return "This can't be undone.";
  }

  const toolWord = item.tools_count === 1 ? "AI Tool" : "AI Tools";

  return (
    `This ${entityLabel} is currently assigned to ${item.tools_count} ${toolWord}. ` +
    `Deleting it will automatically remove it from all associated tools — the tools themselves won't be affected. ` +
    `This can't be undone.`
  );
}
