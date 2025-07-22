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
} from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { api } from "~/trpc/react";

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  subscriptionUpdates: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
  systemMaintenance: z.boolean(),
  trafficWarnings: z.boolean(),
});

type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const updateNotificationSettings = api.user.updateNotificationSettings.useMutation({
    onSuccess: () => {
      toast.success("Настройки уведомлений обновлены");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при обновлении настроек");
      setIsLoading(false);
    },
  });

  const form = useForm<NotificationSettingsData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      subscriptionUpdates: true,
      securityAlerts: true,
      marketingEmails: false,
      systemMaintenance: true,
      trafficWarnings: true,
    },
  });

  async function onSubmit(data: NotificationSettingsData) {
    setIsLoading(true);
    try {
      await updateNotificationSettings.mutateAsync(data);
    } catch {
      // Error is handled in the mutation
    }
  }

  const notificationItems = [
    {
      name: "emailNotifications" as const,
      label: "Email уведомления",
      description: "Основные уведомления по электронной почте",
    },
    {
      name: "subscriptionUpdates" as const,
      label: "Обновления подписки",
      description: "Уведомления о продлении, истечении и изменениях тарифа",
    },
    {
      name: "securityAlerts" as const,
      label: "Оповещения безопасности",
      description: "Важные уведомления о безопасности аккаунта",
    },
    {
      name: "systemMaintenance" as const,
      label: "Технические работы",
      description: "Информация о плановых работах и обновлениях",
    },
    {
      name: "trafficWarnings" as const,
      label: "Предупреждения о трафике",
      description: "Уведомления при приближении к лимиту трафика",
    },
    {
      name: "marketingEmails" as const,
      label: "Маркетинговые письма",
      description: "Информация о новых функциях, акциях и предложениях",
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {notificationItems.map((item) => (
            <FormField
              key={item.name}
              control={form.control}
              name={item.name}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      {item.label}
                    </FormLabel>
                    <FormDescription className="text-sm text-muted-foreground">
                      {item.description}
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
          ))}
        </div>

        <div className="pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить настройки"}
          </Button>
        </div>
      </form>
    </Form>
  );
}