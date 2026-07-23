"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Welcome back, {user.name}
      </h1>
      <Card className="flex flex-col gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        <Badge variant="blue" className="w-fit">
          {user.role.name}
        </Badge>
      </Card>
    </div>
  );
}
