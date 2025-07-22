import { Suspense } from "react";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { UsersList } from "./_components/users-list";
import { UsersStats } from "./_components/users-stats";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Управление пользователями</h1>
        <p className="text-muted-foreground">
          Просмотр и управление зарегистрированными пользователями
        </p>
      </div>

      {/* Users Stats */}
      <Suspense fallback={<UsersStatsSkeleton />}>
        <UsersStats />
      </Suspense>

      {/* Users List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Все пользователи</h3>
        </div>
        <Suspense fallback={<UsersListSkeleton />}>
          <UsersList />
        </Suspense>
      </Card>
    </div>
  );
}

function UsersStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function UsersListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
} 