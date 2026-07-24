"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatDate";
import { TwoFactorSettings } from "./TwoFactorSettings";

export function ProfilePage() {
  const { data: user } = useCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>

      <Card className="flex max-w-md flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
          <Badge variant="blue" className="w-fit">
            {user.role.name}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Account created</p>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {formatDate(user.created_at)}
          </p>
        </div>
      </Card>

      <TwoFactorSettings />
    </div>
  );
}
