"use client";

import { useState } from "react";
import { MoreHorizontal, Play, Pause, Edit, Trash2, TestTube, Loader2 } from "lucide-react";
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

interface PanelActionsProps {
  panelId: string;
  panelName: string;
  isActive: boolean;
}

export function PanelActions({ panelId, panelName, isActive }: PanelActionsProps) {
  const [loading, setLoading] = useState(false);

  const toggleStatus = api.admin.panels.toggleStatus.useMutation({
    onSuccess: () => {
      setLoading(false);
      window.location.reload();
    },
    onError: (error) => {
      setLoading(false);
      alert(`Ошибка: ${error.message}`);
    },
  });

  const deletePanel = api.admin.panels.delete.useMutation({
    onSuccess: () => {
      setLoading(false);
      window.location.reload();
    },
    onError: (error) => {
      setLoading(false);
      alert(`Ошибка: ${error.message}`);
    },
  });

  const testConnection = api.admin.panels.testConnection.useMutation({
    onSuccess: (result) => {
      setLoading(false);
      if (result.success) {
        alert(`✅ ${result.message}\n\nДетали:\n- Хост: ${result.details?.host}:${result.details?.port}\n- Время отклика: ${result.details?.responseTime}мс`);
      } else {
        alert(`❌ ${result.message}\n\nДетали:\n- Хост: ${result.details?.host}:${result.details?.port}\n- Ошибка: ${result.error}`);
      }
    },
    onError: (error) => {
      setLoading(false);
      alert(`Ошибка тестирования: ${error.message}`);
    },
  });

  const handleToggleStatus = async () => {
    const action = isActive ? "деактивировать" : "активировать";
    if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} панель "${panelName}"?`)) {
      setLoading(true);
      toggleStatus.mutate({ id: panelId, isActive: !isActive });
    }
  };

  const handleDeletePanel = async () => {
    if (confirm(`Вы уверены, что хотите удалить панель "${panelName}"? Это действие нельзя отменить.`)) {
      setLoading(true);
      deletePanel.mutate({ id: panelId });
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    testConnection.mutate({ id: panelId });
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality (could open a modal or navigate to edit page)
    alert("Функция редактирования будет реализована");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Действия</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Редактировать
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleTestConnection} disabled={loading}>
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
          onClick={handleDeletePanel}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Удалить панель
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 