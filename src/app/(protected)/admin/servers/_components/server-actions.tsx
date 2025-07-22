"use client";

import { useState } from "react";
import { MoreHorizontal, Play, Pause, Edit, Trash2, TestTube } from "lucide-react";
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

interface ServerActionsProps {
  serverId: string;
  serverName: string;
  isActive: boolean;
}

export function ServerActions({ serverId, serverName, isActive }: ServerActionsProps) {
  const [loading, setLoading] = useState(false);

  const toggleStatus = api.admin.servers.toggleStatus.useMutation({
    onSuccess: () => {
      setLoading(false);
      window.location.reload();
    },
    onError: (error) => {
      setLoading(false);
      alert(`Ошибка: ${error.message}`);
    },
  });

  const deleteServer = api.admin.servers.delete.useMutation({
    onSuccess: () => {
      setLoading(false);
      window.location.reload();
    },
    onError: (error) => {
      setLoading(false);
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleToggleStatus = async () => {
    const action = isActive ? "деактивировать" : "активировать";
    if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} outbound "${serverName}"?`)) {
      setLoading(true);
      toggleStatus.mutate({ id: serverId, isActive: !isActive });
    }
  };

  const handleDeleteServer = async () => {
    if (confirm(`Вы уверены, что хотите удалить outbound "${serverName}"? Это действие нельзя отменить.`)) {
      setLoading(true);
      deleteServer.mutate({ id: serverId });
    }
  };

  const handleTestConnection = async () => {
    // TODO: Implement server connection testing
    alert("Функция тестирования соединения будет реализована");
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality (could open a modal or navigate to edit page)
    alert("Функция редактирования будет реализована");
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
        
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Редактировать
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleTestConnection}>
          <TestTube className="h-4 w-4 mr-2" />
          Тест соединения
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {isActive ? (
          <DropdownMenuItem onClick={handleToggleStatus}>
            <Pause className="h-4 w-4 mr-2" />
            Деактивировать
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleToggleStatus}>
            <Play className="h-4 w-4 mr-2" />
            Активировать
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDeleteServer}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить Outbound
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 