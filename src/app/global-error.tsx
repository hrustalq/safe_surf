"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, Shield } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the critical error to an error reporting service
    console.error("Critical application error:", error);
  }, [error]);

  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-destructive/20">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center text-white">
            {/* Error Icon with Animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 animate-ping">
                <AlertTriangle className="h-20 w-20 mx-auto text-red-400/30" />
              </div>
              <div className="relative">
                <AlertTriangle className="h-20 w-20 mx-auto text-red-400" />
              </div>
            </div>

            {/* Error Content */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">
                Критическая ошибка
              </h1>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Произошла серьёзная ошибка, которая нарушила работу приложения. 
                Мы автоматически получили отчёт об ошибке и уже работаем над исправлением.
              </p>
              
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="text-left bg-slate-800 p-4 rounded-lg mb-6 border border-slate-700">
                  <p className="text-xs font-mono text-slate-400 mb-2">
                    Техническая информация:
                  </p>
                  <p className="text-xs font-mono text-red-300">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs font-mono text-slate-400 mt-2">
                      ID ошибки: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Перезагрузить приложение
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Home className="h-5 w-5" />
                Начать заново
              </button>
            </div>

            {/* Branding */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">SafeSurf VPN</span>
              </div>
              <p className="text-xs text-slate-500">
                Ваша безопасность остаётся нашим приоритетом
              </p>
            </div>

            {/* Contact Information */}
            <div className="mt-6">
              <p className="text-xs text-slate-400">
                Нужна помощь?{" "}
                <a 
                  href="mailto:support@safesurf.tech" 
                  className="text-red-400 hover:text-red-300 underline"
                >
                  Напишите нам
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 