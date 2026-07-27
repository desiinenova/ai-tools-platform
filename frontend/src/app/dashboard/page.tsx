"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Wrench } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useTools } from "@/lib/hooks/useTools";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ToolCard } from "@/components/tools/ToolCard";
import { formatDateTime } from "@/lib/formatDate";

const MY_TOOLS_LIMIT = 5;
const RECOMMENDED_LIMIT = 6;

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wrench;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const [showAllMyTools, setShowAllMyTools] = useState(false);

  const myTools = useTools(user ? { created_by: user.id } : {});
  const recommendedTools = useTools(user ? { role_id: user.role.id } : {});

  if (!user) {
    return null;
  }

  // "Recommended" is meant to surface other people's tools — a user's own
  // submissions are already covered by the "My AI Tools" section above.
  const recommendedForRole = (recommendedTools.data ?? []).filter(
    (tool) => tool.created_by !== user.id,
  );

  const myToolsData = myTools.data ?? [];
  const hasMoreMyTools = myToolsData.length > MY_TOOLS_LIMIT;
  const visibleMyTools = showAllMyTools ? myToolsData : myToolsData.slice(0, MY_TOOLS_LIMIT);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={`Welcome back, ${user.name}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={Wrench}
          label="Tools created"
          value={myTools.isLoading ? "…" : (myTools.data?.length ?? 0)}
        />
        <StatCard
          icon={Clock}
          label="Last login"
          value={user.last_login_at ? formatDateTime(user.last_login_at) : "First login"}
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My AI Tools</h2>
          {hasMoreMyTools && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllMyTools((prev) => !prev)}>
              {showAllMyTools ? "Show less" : "View all"}
            </Button>
          )}
        </div>

        {myTools.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : myToolsData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You haven&apos;t added any tools yet.{" "}
            <Link
              href="/dashboard/tools/new"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Add one
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMyTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recommended for your role
        </h2>

        {recommendedTools.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : recommendedForRole.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tools recommended for your role yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedForRole.slice(0, RECOMMENDED_LIMIT).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
