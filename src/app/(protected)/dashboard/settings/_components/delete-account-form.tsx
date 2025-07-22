"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { api } from "~/trpc/react";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Введите пароль для подтверждения"),
  confirmation: z.literal("DELETE", {
    errorMap: () => ({ message: "Введите DELETE для подтверждения" }),
  }),
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

export function DeleteAccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const deleteAccount = api.user.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Аккаунт успешно удален");
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при удалении аккаунта");
      setIsLoading(false);
    },
  });

  const form = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "DELETE",
    },
  });

  async function onSubmit(data: DeleteAccountFormData) {
    setIsLoading(true);
    try {
      await deleteAccount.mutateAsync({
        password: data.password,
      });
    } catch {
      // Error is handled in the mutation
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Внимание: Необратимое действие
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <ul className="list-disc pl-5 space-y-1">
                <li>Ваш аккаунт будет полностью удален</li>
                <li>Все данные и настройки будут утеряны</li>
                <li>Активные подписки будут отменены</li>
                <li>Это действие нельзя отменить</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            Удалить аккаунт
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              Подтверждение удаления аккаунта
            </AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Ваш аккаунт и все связанные с ним данные 
              будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Введите ваш пароль"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Подтверждение</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Введите DELETE для подтверждения"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isLoading}
                  >
                    {isLoading ? "Удаление..." : "Удалить аккаунт"}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}