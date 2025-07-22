"use client";

import { useState } from "react";
import { Settings, Calendar, Globe, Database, Shield, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import type { RouterOutputs } from "~/trpc/react";

interface PanelConfigurationProps {
  panel: RouterOutputs["admin"]["panels"]["getDetailedInfo"]["panel"];
}

export function PanelConfiguration({ panel }: PanelConfigurationProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const ConfigField = ({ 
    label, 
    value, 
    copyable = false, 
    sensitive = false 
  }: { 
    label: string; 
    value: string; 
    copyable?: boolean; 
    sensitive?: boolean; 
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono bg-muted/50 px-2 py-1 rounded">
          {sensitive ? "•".repeat(value.length) : value}
        </span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(value, label)}
            className="h-6 w-6 p-0"
          >
            {copiedField === label ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Конфигурация панели</h3>
        <p className="text-sm text-muted-foreground">
          Детальная информация о настройках и метаданных панели
        </p>
      </div>

      {/* Panel Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Основная информация
            </CardTitle>
            <CardDescription>
              Базовые настройки подключения к панели
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <ConfigField label="ID панели" value={panel.id} copyable />
            <ConfigField label="Название" value={panel.name} />
            <ConfigField label="Хост" value={panel.host} copyable />
            <ConfigField label="Порт" value={panel.port.toString()} />
            <ConfigField label="Имя пользователя" value={panel.username} copyable />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-muted-foreground">Статус:</span>
              <Badge variant={panel.isActive ? "default" : "secondary"}>
                {panel.isActive ? "Активная" : "Неактивная"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Connection Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Настройки подключения
            </CardTitle>
            <CardDescription>
              API endpoint и параметры соединения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <ConfigField label="API URL" value={panel.apiUrl} copyable />
            
            <div className="py-2">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Полный URL подключения:
              </div>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs break-all">
                {panel.apiUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(panel.apiUrl, "Full URL")}
                className="mt-2"
              >
                {copiedField === "Full URL" ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Копировать URL
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Временные метки
            </CardTitle>
            <CardDescription>
              История создания и обновления панели
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <ConfigField 
              label="Дата создания" 
              value={format(panel.createdAt, "dd MMMM yyyy, HH:mm", { locale: ru })} 
            />
            <ConfigField 
              label="Последнее обновление" 
              value={format(panel.updatedAt, "dd MMMM yyyy, HH:mm", { locale: ru })} 
            />
            
            <div className="pt-2">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Время работы панели:
              </div>
              <div className="text-sm">
                {(() => {
                  const diffMs = Date.now() - panel.createdAt.getTime();
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  
                  if (diffDays > 0) {
                    return `${diffDays} дней ${diffHours} часов`;
                  } else {
                    return `${diffHours} часов`;
                  }
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Безопасность
            </CardTitle>
            <CardDescription>
              Настройки безопасности и аутентификации
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-1">
                <Shield className="h-4 w-4" />
                Предупреждение о безопасности
              </div>
              <div className="text-xs text-amber-700">
                Учетные данные хранятся в зашифрованном виде в базе данных. 
                Рекомендуется регулярно обновлять пароли и использовать надежные учетные данные.
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Аутентификация:</span>
                <Badge variant="outline">Username/Password</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Протокол:</span>
                <Badge variant="outline">
                  {panel.apiUrl.startsWith('https://') ? 'HTTPS' : 'HTTP'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Шифрование:</span>
                <Badge variant={panel.apiUrl.startsWith('https://') ? "default" : "destructive"}>
                  {panel.apiUrl.startsWith('https://') ? 'Включено' : 'Отключено'}
                </Badge>
              </div>
            </div>

            {!panel.apiUrl.startsWith('https://') && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-xs text-red-700">
                  <strong>Внимание:</strong> Соединение не защищено SSL/TLS. 
                  Данные передаются в открытом виде и могут быть перехвачены.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Информация о соединении
          </CardTitle>
          <CardDescription>
            Дополнительные данные о подключении к панели
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Адрес сервера</div>
              <div className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                {new URL(panel.apiUrl).hostname}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Порт API</div>
              <div className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                {new URL(panel.apiUrl).port || (panel.apiUrl.startsWith('https://') ? '443' : '80')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Протокол</div>
              <div className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">
                {new URL(panel.apiUrl).protocol.replace(':', '')}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium mb-2">Пример curl запроса:</div>
            <div className="font-mono text-xs bg-background p-2 rounded border overflow-x-auto whitespace-pre">
{`curl -X POST "${panel.apiUrl}/login" \\
  -H "Content-Type: application/json" \\
  -d '{"username": "${panel.username}", "password": "***"}'`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 