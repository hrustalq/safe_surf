import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, XCircle, Activity, MapPin } from "lucide-react";
import { api } from "~/trpc/server";
import { ServerActions } from "./server-actions";

export async function ServersList() {
  const serversData = await api.admin.servers.getAll({
    page: 1,
    pageSize: 50, // Show all servers for now
  });

  if (!serversData.items.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Серверы не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {serversData.items.map((server) => {
        const loadPercentage = Math.round((server.currentLoad / server.maxClients) * 100);
        const isOverloaded = loadPercentage > 80;
        
        return (
          <div key={server.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {server.isActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">
                  {server.name}
                </h4>
                <Badge 
                  variant={server.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {server.isActive ? "Активный" : "Неактивный"}
                </Badge>
                {isOverloaded && (
                  <Badge variant="destructive" className="text-xs">
                    Перегружен
                  </Badge>
                )}
              </div>
                             <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MapPin className="h-3 w-3" />
                <span>{server.locationRu}</span>
                <span className="px-2 py-1 bg-muted rounded text-xs">
                  {server.protocol.toUpperCase()}
                </span>
                {server.security && (
                  <span className="px-2 py-1 bg-muted rounded text-xs">
                    {server.security.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{server.host}:{server.port}</span>
                {server.outboundTag && (
                  <>
                    <span>•</span>
                    <span className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs">
                      {server.outboundTag}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>Создан: {format(new Date(server.createdAt), "d MMM yyyy", { locale: ru })}</span>
              </div>
            </div>

            <div className="text-right min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {server.currentLoad}/{server.maxClients}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Нагрузка: {loadPercentage}% • Приоритет: {server.priority}
              </p>
              <div className={`w-16 h-1 rounded-full bg-muted ${
                loadPercentage > 80 ? 'bg-red-200' : 
                loadPercentage > 60 ? 'bg-yellow-200' : 'bg-green-200'
              }`}>
                <div 
                  className={`h-full rounded-full ${
                    loadPercentage > 80 ? 'bg-red-500' : 
                    loadPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                />
              </div>
            </div>

            <ServerActions 
              serverId={server.id}
              serverName={server.name}
              isActive={server.isActive}
            />
          </div>
        );
      })}
    </div>
  );
} 