"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: unknown) => void;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Произошла ошибка
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4">
              Что-то пошло не так при отображении этой части страницы.
            </p>

            {this.props.showDetails && this.state.error && (
              <div className="text-left bg-muted p-3 rounded-md mb-4 text-xs">
                <code className="text-destructive">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <Button onClick={this.handleRetry} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Попробовать снова
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
import { useState, useEffect } from "react";

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (error) {
      console.error("Error caught by hook:", error);
      // You can also report to error tracking service here
    }
  }, [error]);

  const resetError = () => setError(null);

  return { error, setError, resetError };
}

// Higher-order component for wrapping components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
} 