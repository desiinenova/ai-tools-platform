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
import { LinkButton } from "@/components/ui/LinkButton";
import { Spinner } from "@/components/ui/Spinner";
import { StateMessage } from "@/components/ui/StateMessage";
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
  description: string;
  category_ids: number[];
  role_ids: number[];
  tag_ids: number[];
  documentation_body: string;
  documentation_url: string;
  image: File | null;
}

const EMPTY_FORM: FormState = {
  name: "",
  website_url: "",
  description: "",
  category_ids: [],
  role_ids: [],
  tag_ids: [],
  documentation_body: "",
  documentation_url: "",
  image: null,
};

function toFormState(tool: Tool): FormState {
  return {
    name: tool.name,
    website_url: tool.website_url,
    description: tool.description,
    category_ids: tool.categories.map((c) => c.id),
    role_ids: tool.roles.map((r) => r.id),
    tag_ids: tool.tags.map((t) => t.id),
    documentation_body: tool.documentation_body ?? "",
    documentation_url: tool.documentation_url ?? "",
    image: null,
  };
}

function toToolInput(form: FormState): ToolInput {
  return {
    name: form.name,
    website_url: form.website_url,
    description: form.description,
    category_ids: form.category_ids,
    role_ids: form.role_ids,
    tag_ids: form.tag_ids,
    documentation_body: form.documentation_body || undefined,
    documentation_url: form.documentation_url || undefined,
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
      <StateMessage
        tone="danger"
        message="This tool couldn't be loaded."
        action={
          <Link
            href="/dashboard/tools"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to AI Tools
          </Link>
        }
      />
    );
  }

  if (mode === "edit" && toolQuery.data && !canEditTool(currentUser, toolQuery.data)) {
    return (
      <StateMessage
        message="You don't have permission to edit this tool."
        action={
          <Link
            href="/dashboard/tools"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to AI Tools
          </Link>
        }
      />
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

          <Textarea
            label="Description"
            hint="A short overview of what this tool is — details, usage, and examples belong in Documentation below."
            required
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            error={fieldErrors.description?.[0]}
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

          <Textarea
            label="Documentation"
            hint="Optional — supports Markdown. This is the place for usage instructions, examples, code snippets, tips, and notes."
            rows={10}
            value={form.documentation_body}
            onChange={(e) => setForm((prev) => ({ ...prev, documentation_body: e.target.value }))}
            error={fieldErrors.documentation_body?.[0]}
          />

          <Input
            label="Official Documentation URL"
            type="url"
            placeholder="https:// (optional)"
            value={form.documentation_url}
            onChange={(e) => setForm((prev) => ({ ...prev, documentation_url: e.target.value }))}
            error={fieldErrors.documentation_url?.[0]}
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
            <LinkButton href="/dashboard/tools" variant="secondary">
              Cancel
            </LinkButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
