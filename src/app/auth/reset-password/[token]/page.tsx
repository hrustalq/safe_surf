"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { z } from "zod";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "Минимум 8 символов" },
    { met: /[A-Z]/.test(formData.password), text: "Одна заглавная буква" },
    { met: /[a-z]/.test(formData.password), text: "Одна строчная буква" },
    { met: /[0-9]/.test(formData.password), text: "Одна цифра" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (!passwordRequirements.every(req => req.met)) {
      setError("Пароль не соответствует требованиям");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json() as z.infer<typeof resetPasswordSchema>;
      const result = resetPasswordSchema.safeParse(data);
      if (!result.success) throw new Error(result.error.errors[0]?.message ?? "Ошибка при сбросе пароля");

      setIsSuccess(true);
      
      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Произошла ошибка при сбросе пароля");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Пароль успешно изменён
            </h1>
            <p className="text-muted-foreground mb-6">
              Вы можете использовать новый пароль для входа в свой аккаунт
            </p>
            <p className="text-sm text-muted-foreground">
              Перенаправление на страницу входа...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">SafeSurf VPN</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Создать новый пароль
          </h1>
          <p className="text-muted-foreground">
            Введите новый пароль для вашего аккаунта
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="password">Новый пароль</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            {formData.password && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle 
                      className={`h-3 w-3 ${req.met ? 'text-green-600' : 'text-muted-foreground'}`} 
                    />
                    <span className={req.met ? 'text-green-600' : 'text-muted-foreground'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              "Сохранить новый пароль"
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Вспомнили пароль?{" "}
            <Link 
              href="/auth/signin" 
              className="text-primary hover:underline font-medium"
            >
              Войти
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}