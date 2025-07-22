"use client";

import { useState } from "react";
import { MoreHorizontal, PlayCircle, PauseCircle, XCircle, RotateCcw } from "lucide-react";
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
import { type SubscriptionStatus } from "@prisma/client";

interface SubscriptionActionsProps {
  subscriptionId: string;
  currentStatus: SubscriptionStatus;
  isExpired: boolean;
}

export function SubscriptionActions({ subscriptionId, currentStatus, isExpired }: SubscriptionActionsProps) {
  const [loading, setLoading] = useState(false);

  const updateStatus = api.admin.subscriptions.updateStatus.useMutation({
    onSuccess: () => {
      setLoading(false);
      window.location.reload();
    },
    onError: (error) => {
      setLoading(false);
      alert(`Ошибка: ${error.message}`);
    },
  });

  const extendSubscription = api.admin.subscriptions.extend.useMutation({
    onSuccess: () => {
      setLoading(false);
      window.location.reload();
    },
    onError: (error) => {
      setLoading(false);
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleStatusChange = async (newStatus: SubscriptionStatus) => {
    if (confirm(`Изменить статус подписки на ${newStatus}?`)) {
      setLoading(true);
      updateStatus.mutate({ subscriptionId, status: newStatus });
    }
  };

  const handleExtend = async (days: number) => {
    if (confirm(`Продлить подписку на ${days} дней?`)) {
      setLoading(true);
      extendSubscription.mutate({ subscriptionId, days });
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
        
        {currentStatus === "PENDING" && (
          <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Активировать
          </DropdownMenuItem>
        )}
        
        {currentStatus === "ACTIVE" && (
          <DropdownMenuItem onClick={() => handleStatusChange("CANCELLED")}>
            <PauseCircle className="h-4 w-4 mr-2" />
            Приостановить
          </DropdownMenuItem>
        )}
        
        {currentStatus === "CANCELLED" && (
          <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Восстановить
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleExtend(30)}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Продлить на 30 дней
        </DropdownMenuItem>
        
        {(isExpired || currentStatus === "EXPIRED") && (
          <DropdownMenuItem onClick={() => handleExtend(30)}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Продлить истекшую
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleStatusChange("CANCELLED")}
          className="text-destructive focus:text-destructive"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Отменить подписку
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 