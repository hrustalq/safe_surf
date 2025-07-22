"use client";

import { useState } from "react";
import { FileText, Search, Download, RefreshCw, AlertTriangle, Info, Bug } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface PanelServerLogsProps {
  serverLogs: string;
}

export function PanelServerLogs({ serverLogs }: PanelServerLogsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [logLevel, setLogLevel] = useState<string>("all");

  // Parse logs into lines and extract log level if possible
  const parseLogLines = (logs: string) => {
    if (!logs || typeof logs !== 'string') {
      return [];
    }

    return logs.split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        // Try to detect log level
        let level = 'info';
        let timestamp = '';
        let message = trimmedLine;

        // Common log patterns
        const errorPatterns = /error|fail|exception|panic|fatal/i;
        const warnPatterns = /warn|warning|deprecated/i;
        const infoPatterns = /info|start|stop|connect|disconnect/i;
        
        if (errorPatterns.test(trimmedLine)) {
          level = 'error';
        } else if (warnPatterns.test(trimmedLine)) {
          level = 'warning';
        } else if (infoPatterns.test(trimmedLine)) {
          level = 'info';
        }

        // Try to extract timestamp (basic patterns)
        const timestampMatch = /^\d{4}-\d{2}-\d{2}[\s\T]\d{2}:\d{2}:\d{2}/.exec(trimmedLine);
        if (timestampMatch) {
          timestamp = timestampMatch[0];
          message = trimmedLine.substring(timestampMatch[0].length).trim();
        }

        return {
          id: index,
          line: trimmedLine,
          level,
          timestamp,
          message,
        };
      })
      .filter(Boolean);
  };

  const logLines = parseLogLines(serverLogs);

  // Filter logs based on search and level
  const filteredLogs = logLines.filter((log) => {
    if (!log) return false;

    // Level filter
    if (logLevel !== 'all' && log.level !== logLevel) {
      return false;
    }

    // Search filter
    if (searchQuery && !log.line.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  const handleDownload = () => {
    const blob = new Blob([serverLogs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'info':
        return <Info className="h-3 w-3 text-blue-500" />;
      default:
        return <Bug className="h-3 w-3 text-gray-500" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Логи сервера</h3>
        <p className="text-sm text-muted-foreground">
          Журнал событий и ошибок X-Ray сервера
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск в логах..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Select value={logLevel} onValueChange={setLogLevel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все уровни</SelectItem>
              <SelectItem value="error">Ошибки</SelectItem>
              <SelectItem value="warning">Предупреждения</SelectItem>
              <SelectItem value="info">Информация</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Скачать
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Всего строк</div>
              <div className="text-lg font-bold">{logLines.length}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm font-medium">Ошибки</div>
              <div className="text-lg font-bold">
                {logLines.filter(log => log?.level === 'error').length}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div>
              <div className="text-sm font-medium">Предупреждения</div>
              <div className="text-lg font-bold">
                {logLines.filter(log => log?.level === 'warning').length}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Отфильтровано</div>
              <div className="text-lg font-bold">{filteredLogs.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Журнал событий
          </CardTitle>
          <CardDescription>
            {filteredLogs.length > 0 
              ? `Показано ${filteredLogs.length} из ${logLines.length} записей`
              : "Записи не найдены или логи пусты"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <ScrollArea className="h-96 w-full border rounded">
              <div className="p-4 space-y-2">
                {filteredLogs.map((log) => {
                  if (!log) return null;
                  
                  return (
                    <div 
                      key={log.id}
                      className={`flex items-start gap-3 p-2 rounded text-xs border ${getLogLevelColor(log.level)}`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getLogLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {log.timestamp && (
                          <div className="font-mono text-xs text-muted-foreground mb-1">
                            {log.timestamp}
                          </div>
                        )}
                        <div className="font-mono whitespace-pre-wrap break-words">
                          {log.message || log.line}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {log.level.toUpperCase()}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {serverLogs ? (
                searchQuery || logLevel !== 'all' ? (
                  <>
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Записи не найдены</p>
                    <p className="text-sm mt-1">Попробуйте изменить поисковый запрос или фильтр</p>
                  </>
                ) : (
                  <>
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Логи пусты</p>
                    <p className="text-sm mt-1">Сервер не сгенерировал записей в журнале</p>
                  </>
                )
              ) : (
                <>
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50 text-destructive" />
                  <p className="font-medium">Логи недоступны</p>
                  <p className="text-sm mt-1">Не удается получить логи сервера</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 