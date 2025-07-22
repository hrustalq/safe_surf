"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { api } from "~/trpc/react";

const settingsSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(50, "Имя не должно превышать 50 символов"),
  timezone: z.string().min(1, "Выберите часовой пояс"),
  language: z.string().min(1, "Выберите язык"),
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    // Add other user properties as needed
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const updateSettings = api.user.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Настройки успешно обновлены");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при обновлении настроек");
      setIsLoading(false);
    },
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user.name ?? "",
      timezone: "Europe/Moscow",
      language: "ru",
      theme: "system",
      emailNotifications: true,
      marketingEmails: false,
    },
  });

  async function onSubmit(data: SettingsFormData) {
    setIsLoading(true);
    try {
      await updateSettings.mutateAsync(data);
    } catch {
      // Error is handled in the mutation
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input placeholder="Ваше имя" {...field} />
              </FormControl>
              <FormDescription>
                Это имя будет отображаться в вашем профиле
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Часовой пояс</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите часовой пояс" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Europe/Moscow">Москва (UTC+3)</SelectItem>
                  <SelectItem value="Europe/Kiev">Киев (UTC+2)</SelectItem>
                  <SelectItem value="Europe/Minsk">Минск (UTC+3)</SelectItem>
                  <SelectItem value="Asia/Almaty">Алматы (UTC+6)</SelectItem>
                  <SelectItem value="Asia/Tashkent">Ташкент (UTC+5)</SelectItem>
                  <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Используется для отображения времени в интерфейсе
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Язык</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите язык" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uk">Українська</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Язык интерфейса приложения
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тема</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тему" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Светлая</SelectItem>
                  <SelectItem value="dark">Тёмная</SelectItem>
                  <SelectItem value="system">Системная</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Тема оформления интерфейса
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Email уведомления
                </FormLabel>
                <FormDescription>
                  Получать уведомления о важных событиях аккаунта
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="marketingEmails"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Маркетинговые письма
                </FormLabel>
                <FormDescription>
                  Получать информацию о новых функциях и акциях
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить изменения"}
        </Button>
      </form>
    </Form>
  );
}