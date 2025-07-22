"use client";

import { useState } from "react";
import { MoreHorizontal, UserCog, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";
import { type UserRole } from "@prisma/client";

interface UserActionsProps {
  userId: string;
  currentRole: UserRole;
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const [loading, setLoading] = useState(false);

  const updateUserRole = api.admin.users.updateRole.useMutation({
    onSuccess: () => {
      setLoading(false);
      window.location.reload(); // Simple refresh - in production, use more sophisticated state management
    },
    onError: (error) => {
      setLoading(false);
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleRoleChange = async (newRole: UserRole) => {
    if (confirm(`Изменить роль пользователя на ${newRole}?`)) {
      setLoading(true);
      updateUserRole.mutate({ userId, role: newRole });
    }
  };

  const handleDeleteUser = async () => {
    if (confirm("Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.")) {
      setLoading(true);
      // TODO: Implement user deletion
      alert("Функция удаления пользователей будет реализована");
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Действия</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {currentRole !== "ADMIN" && (
          <DropdownMenuItem onClick={() => handleRoleChange("ADMIN")}>
            <UserCog className="h-4 w-4 mr-2" />
            Сделать админом
          </DropdownMenuItem>
        )}
        
        {currentRole === "ADMIN" && (
          <DropdownMenuItem onClick={() => handleRoleChange("USER")}>
            <UserCog className="h-4 w-4 mr-2" />
            Снять права админа
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDeleteUser}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить пользователя
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 