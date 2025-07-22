"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as z.infer<typeof resetPasswordSchema>;
      const result = resetPasswordSchema.safeParse(data);
      if (!result.success) throw new Error(result.error.errors[0]?.message ?? "Ошибка при отправке запроса");

      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Произошла ошибка. Попробуйте позже.");
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
              Проверьте вашу почту
            </h1>
            <p className="text-muted-foreground mb-6">
              Мы отправили инструкции по восстановлению пароля на адрес <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Письмо может прийти в течение нескольких минут. Также проверьте папку &quot;Спам&quot;.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                Вернуться к входу
              </Link>
            </Button>
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
            Восстановление пароля
          </h1>
          <p className="text-muted-foreground">
            Введите email, и мы отправим инструкции по восстановлению
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
            <Label htmlFor="email">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Отправка...
              </>
            ) : (
              "Отправить инструкции"
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button variant="link" asChild className="text-muted-foreground">
            <Link href="/auth/signin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к входу
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}