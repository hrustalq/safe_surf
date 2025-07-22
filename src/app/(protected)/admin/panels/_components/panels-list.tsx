import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CheckCircle, XCircle, Globe, ExternalLink } from "lucide-react";
import { api } from "~/trpc/server";
import { PanelActions } from "./panel-actions";

export async function PanelsList() {
  const panels = await api.admin.panels.getAll();

  if (!panels.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Панели не найдены</p>
        <p className="text-sm mt-2">Добавьте 3X-UI панель для управления outbound серверами</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {panels.map((panel) => (
        <div key={panel.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            {panel.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">
                {panel.name}
              </h4>
              <Badge 
                variant={panel.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {panel.isActive ? "Активная" : "Неактивная"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Globe className="h-3 w-3" />
              <span className="truncate">{panel.apiUrl}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{panel.host}:{panel.port}</span>
              <span>•</span>
              <span>Пользователь: {panel.username}</span>
              <span>•</span>
              <span>Создана: {format(new Date(panel.createdAt), "d MMM yyyy", { locale: ru })}</span>
            </div>
          </div>

          <div className="text-right min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${panel.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {panel.isActive ? "Работает" : "Остановлена"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Обновлена: {format(new Date(panel.updatedAt), "d MMM", { locale: ru })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/panels/${panel.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Подробно
              </Button>
            </Link>
            <PanelActions 
              panelId={panel.id}
              panelName={panel.name}
              isActive={panel.isActive}
            />
          </div>
        </div>
      ))}
    </div>
  );
} 