"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, TestTube } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { api } from "~/trpc/react";
import { createPanelDto } from "~/server/api/routers/admin/dto/servers.dto";
import type { z } from "zod";

export function AddPanelForm() {
  const [open, setOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(createPanelDto),
    defaultValues: {
      name: "",
      host: "",
      username: "",
      password: "",
      apiUrl: "",
    },
  });

  const createPanel = api.admin.panels.create.useMutation({
    onSuccess: () => {
      form.reset();
      setOpen(false);
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error creating panel:", error);
    },
  });

  const testConnection = api.admin.panels.testConnection.useMutation({
    onSuccess: (result) => {
      setTestingConnection(false);
      if (result.success) {
        alert(`✅ ${result.message}\n\nДетали:\n- Хост: ${result.details?.host}:${result.details?.port}\n- Время отклика: ${result.details?.responseTime}мс`);
      } else {
        alert(`❌ ${result.message}\n\nДетали:\n- Хост: ${result.details?.host}:${result.details?.port}\n- Ошибка: ${result.error}`);
      }
    },
    onError: (error) => {
      setTestingConnection(false);
      alert(`Ошибка тестирования: ${error.message}`);
    },
  });

  const onSubmit = (data: z.infer<typeof createPanelDto>) => {
    createPanel.mutate(data);
  };

  const handleTestConnection = () => {
    const values = form.getValues();
    
    if (!values.host || !values.username || !values.password || !values.apiUrl) {
      alert("Пожалуйста, заполните все обязательные поля для тестирования соединения");
      return;
    }

    setTestingConnection(true);
    testConnection.mutate({
      host: values.host,
      port: values.port,
      username: values.username,
      password: values.password,
      apiUrl: values.apiUrl,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Добавить панель
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить 3X-UI панель</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название панели</FormLabel>
                    <FormControl>
                      <Input placeholder="Main 3X-UI Panel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Хост</FormLabel>
                    <FormControl>
                      <Input placeholder="panel.example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Порт</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="54321" 
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя пользователя</FormLabel>
                    <FormControl>
                      <Input placeholder="admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API URL</FormLabel>
                    <FormControl>
                      <Input placeholder="http://panel.example.com:54321" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Активная панель
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Панель будет доступна для управления outbound серверами
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={createPanel.isPending || testingConnection}
              >
                {testingConnection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <TestTube className="h-4 w-4 mr-2" />
                Тест соединения
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={createPanel.isPending || testingConnection}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={createPanel.isPending || testingConnection}
              >
                {createPanel.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Создать панель
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 