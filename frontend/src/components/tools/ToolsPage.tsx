"use client";

import { Suspense, useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useTools } from "@/lib/hooks/useTools";
import { parseToolFilters, serializeToolFilters } from "@/lib/toolFilters";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ToolFilters } from "./ToolFilters";
import { ToolList } from "./ToolList";
import type { ToolFilters as ToolFiltersValue } from "@/types";

function ToolsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => parseToolFilters(searchParams), [searchParams]);

  const applyFilters = useCallback(
    (next: ToolFiltersValue) => {
      const qs = serializeToolFilters(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  // If the URL contains invalid/malformed params (or a non-canonical param
  // order), converge it to the clean representation parseToolFilters
  // actually produced. This runs at most once per navigation: after the
  // replace, recomputed filters serialize to exactly what's now in the URL.
  useEffect(() => {
    const normalized = serializeToolFilters(filters).toString();
    if (normalized !== searchParams.toString()) {
      router.replace(normalized ? `${pathname}?${normalized}` : pathname, { scroll: false });
    }
  }, [filters, searchParams, pathname, router]);

  const { data: tools, isLoading, isFetching, error, refetch } = useTools(filters);
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Tools"
        description={isLoading ? "Loading…" : `${tools?.length ?? 0} tool${tools?.length === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/dashboard/tools/new">
            <Plus className="h-4 w-4" aria-hidden />
            Add Tool
          </LinkButton>
        }
      />

      <ToolFilters filters={filters} onFilterChange={applyFilters} />

      <ToolList
        tools={tools}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        hasActiveFilters={hasActiveFilters}
        onRetry={refetch}
      />
    </div>
  );
}

export function ToolsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ToolsPageContent />
    </Suspense>
  );
}
