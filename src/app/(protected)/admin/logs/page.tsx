import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { AlertCircle, Info, AlertTriangle, CheckCircle } from "lucide-react";

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Системные логи</h1>
        <p className="text-muted-foreground">
          Мониторинг системных событий и логов
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Последние события</h3>
          <Badge variant="secondary">В разработке</Badge>
        </div>

        <div className="space-y-4">
          {/* Mock log entries for demo */}
          {[
            {
              type: "info",
              message: "Новый пользователь зарегистрировался: test@example.com",
              timestamp: "2024-01-15 10:30:15",
              icon: CheckCircle,
              color: "text-green-500",
            },
            {
              type: "warning",
              message: "Высокая нагрузка на сервер US-East-1 (85%)",
              timestamp: "2024-01-15 10:28:42",
              icon: AlertTriangle,
              color: "text-yellow-500",
            },
            {
              type: "info",
              message: "Успешная оплата подписки Premium (#12345)",
              timestamp: "2024-01-15 10:25:18",
              icon: Info,
              color: "text-blue-500",
            },
            {
              type: "error",
              message: "Ошибка подключения к серверу EU-West-2",
              timestamp: "2024-01-15 10:20:33",
              icon: AlertCircle,
              color: "text-red-500",
            },
            {
              type: "info",
              message: "Подписка пользователя истекла: user@example.com",
              timestamp: "2024-01-15 10:15:07",
              icon: Info,
              color: "text-blue-500",
            },
          ].map((log, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
              <log.icon className={`h-5 w-5 mt-0.5 ${log.color}`} />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">{log.message}</p>
                <p className="text-xs text-muted-foreground">{log.timestamp}</p>
              </div>
              <Badge 
                variant={
                  log.type === "error" ? "destructive" :
                  log.type === "warning" ? "secondary" : "outline"
                }
              >
                {log.type === "error" ? "Ошибка" :
                 log.type === "warning" ? "Предупреждение" : "Информация"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-muted-foreground">
          <p>Интеграция с системой логирования будет добавлена в следующих версиях</p>
          <p className="text-sm mt-2">
            Планируется: интеграция с Winston, сохранение в базу данных, фильтрация по типам
          </p>
        </div>
      </Card>
    </div>
  );
} 