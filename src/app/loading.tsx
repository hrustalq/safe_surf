"use client";

import { Shield } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center">
        {/* Animated Shield Logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping">
            <Shield className="h-16 w-16 mx-auto text-primary/20" />
          </div>
          <div className="relative">
            <Shield className="h-16 w-16 mx-auto text-primary animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground animate-pulse">
            SafeSurf VPN
          </h1>
          <p className="text-muted-foreground animate-pulse">
            Защищаем ваше соединение...
          </p>
          
          {/* Loading Bar */}
          <div className="w-64 mx-auto bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" 
                 style={{
                   animation: 'loading-bar 2s ease-in-out infinite',
                 }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
} 