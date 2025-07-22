import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Loader, 
  MapPin,
  Monitor,
  Trash2,
  Activity,
  Server
} from "lucide-react";
import { api } from "~/trpc/server";
import { 
  Alert, 
  AlertDescription 
} from "~/components/ui/alert";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { LoadingSpinner } from "~/components/ui/loading-spinner";

// Status badge component
function ProvisionStatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'READY':
        return { variant: 'default' as const, icon: CheckCircle, text: 'Готов', color: 'text-green-500' };
      case 'PROVISIONING':
        return { variant: 'secondary' as const, icon: Clock, text: 'Создается', color: 'text-blue-500' };
      case 'INSTALLING':
        return { variant: 'secondary' as const, icon: Loader, text: 'Установка', color: 'text-blue-500' };
      case 'CONFIGURING':
        return { variant: 'secondary' as const, icon: Loader, text: 'Настройка', color: 'text-blue-500' };
      case 'ERROR':
        return { variant: 'destructive' as const, icon: XCircle, text: 'Ошибка', color: 'text-red-500' };
      case 'DESTROYING':
        return { variant: 'outline' as const, icon: Trash2, text: 'Удаляется', color: 'text-orange-500' };
      case 'MANUAL':
        return { variant: 'outline' as const, icon: Server, text: 'Ручной', color: 'text-gray-500' };
      default:
        return { variant: 'secondary' as const, icon: AlertTriangle, text: 'Неизвестно', color: 'text-gray-500' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className={`h-3 w-3 ${config.color}`} />
      {config.text}
    </Badge>
  );
}

export async function ProvisionedServersList() {
  let serversData;
  let error = null;

  try {
    serversData = await api.admin.digitalOcean.getProvisionedServers({
      page: 1,
      pageSize: 50,
    });
  } catch (err) {
    error = err;
    serversData = null;
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Ошибка загрузки</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Не удалось загрузить список серверов. Проверьте настройки Digital Ocean API.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!serversData?.items.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>Провизионированные серверы</CardTitle>
          </div>
          <CardDescription>
            Серверы, автоматически созданные через Digital Ocean
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Нет провизионированных серверов</p>
            <p className="text-sm">Создайте первый сервер с помощью формы выше</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>Провизионированные серверы ({serversData.total})</CardTitle>
          </div>
        </div>
        <CardDescription>
          Автоматически созданные серверы через Digital Ocean API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {serversData.items.map((server) => (
            <div 
              key={server.id} 
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {server.provisionStatus === 'READY' ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ) : server.provisionStatus === 'ERROR' ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <LoadingSpinner className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </div>

              {/* Server Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium truncate">
                    {server.name}
                  </h4>
                  <ProvisionStatusBadge status={server.provisionStatus} />
                  {server.isActive ? (
                    <Badge variant="outline" className="text-green-600">
                      <Activity className="h-3 w-3 mr-1" />
                      Активный
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Неактивный
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{server.locationRu}</span>
                  </div>
                  
                  {server.digitalOceanRegion && (
                    <div className="flex items-center gap-1">
                      <Monitor className="h-3 w-3" />
                      <span>{server.digitalOceanRegion}</span>
                      {server.digitalOceanSize && (
                        <span className="text-xs">({server.digitalOceanSize})</span>
                      )}
                    </div>
                  )}

                  <div>
                    <span className="font-mono text-xs">{server.host}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>
                    Создан: {format(new Date(server.createdAt), "dd MMM yyyy, HH:mm", { locale: ru })}
                  </span>
                  {server.lastHealthCheck && (
                    <span>
                      Проверка: {format(new Date(server.lastHealthCheck), "dd MMM yyyy, HH:mm", { locale: ru })}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {server.provisionStatus === 'READY' && (
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Load more indicator if needed */}
          {serversData.hasMore && (
            <div className="text-center pt-4">
              <Button variant="outline">
                Показать еще ({serversData.total - serversData.items.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 