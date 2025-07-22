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
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";

const profileSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(50, "Имя не должно превышать 50 символов"),
  bio: z.string().max(500, "Описание не должно превышать 500 символов").optional(),
  company: z.string().max(100, "Название компании не должно превышать 100 символов").optional(),
  website: z.string().url("Введите корректный URL").optional().or(z.literal("")),
  location: z.string().max(100, "Местоположение не должно превышать 100 символов").optional(),
  timezone: z.string().min(1, "Выберите часовой пояс"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    // Add other user properties as needed
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Профиль успешно обновлен");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при обновлении профиля");
      setIsLoading(false);
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      bio: "",
      company: "",
      website: "",
      location: "",
      timezone: "Europe/Moscow",
    },
  });

  async function onSubmit(data: ProfileFormData) {
    setIsLoading(true);
    try {
      await updateProfile.mutateAsync(data);
    } catch {
      // Error is handled in the mutation
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя *</FormLabel>
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
                <FormLabel>Часовой пояс *</FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>О себе</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Расскажите немного о себе..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Краткое описание о вас (не более 500 символов)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Компания</FormLabel>
                <FormControl>
                  <Input placeholder="Название компании" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Местоположение</FormLabel>
                <FormControl>
                  <Input placeholder="Город, страна" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Веб-сайт</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormDescription>
                Ваш личный веб-сайт или социальная сеть
              </FormDescription>
              <FormMessage />
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