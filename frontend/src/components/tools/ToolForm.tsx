"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useCategories } from "@/lib/hooks/useCategories";
import { useRoles } from "@/lib/hooks/useRoles";
import { useTags } from "@/lib/hooks/useTags";
import { useCreateTool, useTool, useUpdateTool } from "@/lib/hooks/useTools";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { canEditTool } from "@/lib/permissions";
import { ApiError } from "@/lib/api";
import type { Tool, ToolInput, ValidationErrorBody } from "@/types";

export interface ToolFormProps {
  mode: "create" | "edit";
  toolId?: number;
}

// Mirrors ToolRequest's max:4096 (KB) rule — an immediate client-side check
// for UX only. The server remains the source of truth if these ever drift.
const MAX_IMAGE_SIZE_BYTES = 4096 * 1024;

interface FormState {
  name: string;
  website_url: string;
  documentation_url: string;
  description: string;
  how_to_use: string;
  examples: string;
  category_ids: number[];
  role_ids: number[];
  tag_ids: number[];
  image: File | null;
}

const EMPTY_FORM: FormState = {
  name: "",
  website_url: "",
  documentation_url: "",
  description: "",
  how_to_use: "",
  examples: "",
  category_ids: [],
  role_ids: [],
  tag_ids: [],
  image: null,
};

function toFormState(tool: Tool): FormState {
  return {
    name: tool.name,
    website_url: tool.website_url,
    documentation_url: tool.documentation_url ?? "",
    description: tool.description,
    how_to_use: tool.how_to_use ?? "",
    examples: tool.examples ?? "",
    category_ids: tool.categories.map((c) => c.id),
    role_ids: tool.roles.map((r) => r.id),
    tag_ids: tool.tags.map((t) => t.id),
    image: null,
  };
}

function toToolInput(form: FormState): ToolInput {
  return {
    name: form.name,
    website_url: form.website_url,
    documentation_url: form.documentation_url || undefined,
    description: form.description,
    how_to_use: form.how_to_use || undefined,
    examples: form.examples || undefined,
    category_ids: form.category_ids,
    role_ids: form.role_ids,
    tag_ids: form.tag_ids,
    image: form.image ?? undefined,
  };
}

export function ToolForm({ mode, toolId }: ToolFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const { data: currentUser } = useCurrentUser();
  const { data: categories } = useCategories();
  const { data: roles } = useRoles();
  const { data: tags } = useTags();

  const toolQuery = useTool(toolId ?? 0);
  const createTool = useCreateTool();
  const updateTool = useUpdateTool();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [hasSeeded, setHasSeeded] = useState(mode === "create");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Seed the form once when the existing tool loads; don't re-seed on
  // background refetches, or an in-progress edit would get clobbered.
  useEffect(() => {
    if (mode === "edit" && toolQuery.data && !hasSeeded) {
      setForm(toFormState(toolQuery.data));
      setHasSeeded(true);
    }
  }, [mode, toolQuery.data, hasSeeded]);

  const isSubmitting = createTool.isPending || updateTool.isPending;

  function handleImageChange(image: File | null) {
    if (image && image.size > MAX_IMAGE_SIZE_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        image: ["The selected image exceeds the maximum allowed size (4 MB)."],
      }));
      return;
    }

    setFieldErrors((prev) => {
      const rest = { ...prev };
      delete rest.image;
      return rest;
    });
    setForm((prev) => ({ ...prev, image }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const input = toToolInput(form);

    const onSuccess = () => {
      toast({ title: mode === "create" ? "Tool created." : "Tool updated.", variant: "success" });
      router.push("/dashboard/tools");
    };

    const onError = (err: unknown) => {
      if (err instanceof ApiError && err.status === 422) {
        const body = err.body as ValidationErrorBody;
        setFieldErrors(body.errors ?? {});
        toast({ title: "Please fix the errors below.", variant: "error" });
      } else {
        toast({ title: "Something went wrong. Please try again.", variant: "error" });
      }
    };

    if (mode === "create") {
      createTool.mutate(input, { onSuccess, onError });
    } else if (toolId) {
      updateTool.mutate({ id: toolId, input }, { onSuccess, onError });
    }
  }

  if (mode === "edit" && toolQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (mode === "edit" && toolQuery.error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">This tool couldn&apos;t be loaded.</p>
        <Link
          href="/dashboard/tools"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Back to AI Tools
        </Link>
      </div>
    );
  }

  if (mode === "edit" && toolQuery.data && !canEditTool(currentUser, toolQuery.data)) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-gray-600 dark:text-gray-400">You don&apos;t have permission to edit this tool.</p>
        <Link
          href="/dashboard/tools"
          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Back to AI Tools
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {mode === "create" ? "Add Tool" : "Edit Tool"}
      </h1>

      <Card>
        <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            error={fieldErrors.name?.[0]}
          />

          <Input
            label="Website URL"
            type="url"
            required
            placeholder="https://…"
            value={form.website_url}
            onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))}
            error={fieldErrors.website_url?.[0]}
          />

          <Input
            label="Documentation URL"
            type="url"
            placeholder="https:// (optional)"
            value={form.documentation_url}
            onChange={(e) => setForm((prev) => ({ ...prev, documentation_url: e.target.value }))}
            error={fieldErrors.documentation_url?.[0]}
          />

          <Textarea
            label="Description"
            required
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            error={fieldErrors.description?.[0]}
          />

          <Textarea
            label="Usage instructions"
            hint="Optional — how should teammates get started with this tool?"
            value={form.how_to_use}
            onChange={(e) => setForm((prev) => ({ ...prev, how_to_use: e.target.value }))}
            error={fieldErrors.how_to_use?.[0]}
          />

          <Textarea
            label="Examples"
            hint="Optional — real-world examples or links"
            value={form.examples}
            onChange={(e) => setForm((prev) => ({ ...prev, examples: e.target.value }))}
            error={fieldErrors.examples?.[0]}
          />

          <MultiSelect
            label="Categories"
            placeholder="Select categories…"
            options={(categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
            selected={form.category_ids.map(String)}
            onChange={(values) => setForm((prev) => ({ ...prev, category_ids: values.map(Number) }))}
            error={fieldErrors.category_ids?.[0]}
          />

          <MultiSelect
            label="Roles"
            placeholder="Select roles…"
            options={(roles ?? []).map((r) => ({ value: String(r.id), label: r.name }))}
            selected={form.role_ids.map(String)}
            onChange={(values) => setForm((prev) => ({ ...prev, role_ids: values.map(Number) }))}
            error={fieldErrors.role_ids?.[0]}
          />

          <MultiSelect
            label="Tags"
            placeholder="Select tags…"
            options={(tags ?? []).map((t) => ({ value: String(t.id), label: t.name }))}
            selected={form.tag_ids.map(String)}
            onChange={(values) => setForm((prev) => ({ ...prev, tag_ids: values.map(Number) }))}
            error={fieldErrors.tag_ids?.[0]}
          />

          <ImageUpload
            label="Image"
            hint="Supported formats: JPG, JPEG, PNG, WEBP. Maximum file size: 4 MB."
            value={form.image}
            onChange={handleImageChange}
            existingImageUrl={mode === "edit" ? toolQuery.data?.image_url : null}
            error={fieldErrors.image?.[0]}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" isLoading={isSubmitting}>
              {mode === "create" ? "Create tool" : "Save changes"}
            </Button>
            <Link
              href="/dashboard/tools"
              className="text-sm font-medium text-gray-600 hover:underline dark:text-gray-400"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
