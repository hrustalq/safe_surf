"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Что-то пошло не так
          </h1>
          <p className="text-muted-foreground mb-4">
            Произошла неожиданная ошибка при загрузке страницы. 
            Мы уже работаем над исправлением.
          </p>
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="text-left bg-muted p-3 rounded-md mb-4">
              <p className="text-xs font-mono text-muted-foreground">
                Ошибка: {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button 
            onClick={reset} 
            className="w-full"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
          
          <Button 
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Link>
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Если проблема повторяется, свяжитесь с{" "}
            <Link 
              href="/contact" 
              className="text-primary hover:underline"
            >
              технической поддержкой
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
} 