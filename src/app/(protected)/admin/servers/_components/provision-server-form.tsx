"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { LoadingSpinner } from "~/components/ui/loading-spinner";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { AlertTriangle, Server, Plus } from "lucide-react";

const provisionSchema = z.object({
  name: z.string().min(1, "Название сервера обязательно"),
  location: z.string().min(1, "Локация обязательна"),
  locationRu: z.string().min(1, "Русское название локации обязательно"),
  region: z.string().min(1, "Регион обязателен"),
  size: z.string().min(1, "Размер VPS обязателен"),
});

type ProvisionFormData = z.infer<typeof provisionSchema>;

interface ProvisionServerFormProps {
  onSuccess?: () => void;
}

export function ProvisionServerForm({ onSuccess }: ProvisionServerFormProps) {
  const [isProvisioning, setIsProvisioning] = useState(false);

  const { data: regions, isLoading: regionsLoading } = api.admin.digitalOcean.getRegions.useQuery({
    page: 1,
    pageSize: 100,
  });
  const { data: sizes, isLoading: sizesLoading } = api.admin.digitalOcean.getSizes.useQuery({
    page: 1,
    pageSize: 100,
  });

  const provisionMutation = api.admin.digitalOcean.provisionServer.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Провизионирование сервера запущено! ID: ${data.serverId}`);
        reset();
        onSuccess?.();
      } else {
        toast.error(`Ошибка: ${data.message}`);
      }
      setIsProvisioning(false);
    },
    onError: (error) => {
      toast.error(`Ошибка провизионирования: ${error.message}`);
      setIsProvisioning(false);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProvisionFormData>({
    resolver: zodResolver(provisionSchema),
  });

  const watchedRegion = watch("region");
  const watchedSize = watch("size");

  const onSubmit = async (data: ProvisionFormData) => {
    setIsProvisioning(true);
    provisionMutation.mutate(data);
  };

  const isLoading = regionsLoading || sizesLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>Провизионирование сервера</CardTitle>
          </div>
          <CardDescription>
            Загрузка конфигурации Digital Ocean...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!regions?.length || !sizes?.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>Провизионирование сервера</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Digital Ocean API недоступно. Проверьте настройки подключения.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          <CardTitle>Провизионирование нового сервера</CardTitle>
        </div>
        <CardDescription>
          Создание нового VPS сервера с автоматической установкой V2Ray
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Server Name and Locations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название сервера</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="например: Germany Frankfurt"
                disabled={isProvisioning}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Локация (английский)</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="например: Frankfurt, Germany"
                disabled={isProvisioning}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationRu">Локация (русский)</Label>
            <Input
              id="locationRu"
              {...register("locationRu")}
              placeholder="например: Франкфурт, Германия"
              disabled={isProvisioning}
            />
            {errors.locationRu && (
              <p className="text-sm text-destructive">{errors.locationRu.message}</p>
            )}
          </div>

          {/* Region and Size Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Регион Digital Ocean</Label>
              <Select 
                onValueChange={(value) => setValue("region", value)}
                disabled={isProvisioning}
                value={watchedRegion}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите регион" />
                </SelectTrigger>
                <SelectContent>
                  {regions.filter(r => r.available).map((region) => (
                    <SelectItem key={region.slug} value={region.slug}>
                      {region.name} ({region.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && (
                <p className="text-sm text-destructive">{errors.region.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Размер VPS</Label>
              <Select 
                onValueChange={(value) => setValue("size", value)}
                disabled={isProvisioning}
                value={watchedSize}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите размер" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.filter(s => s.available).map((size) => (
                    <SelectItem key={size.slug} value={size.slug}>
                      <div className="flex flex-col">
                        <span className="font-medium">{size.slug}</span>
                        <span className="text-sm text-muted-foreground">
                          {size.vcpus} CPU, {size.memory}MB RAM, ${size.price_monthly}/мес
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.size && (
                <p className="text-sm text-destructive">{errors.size.message}</p>
              )}
            </div>
          </div>

          {/* Cost estimation */}
          {watchedSize && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Выбранная конфигурация будет стоить{" "}
                <strong>${sizes.find(s => s.slug === watchedSize)?.price_monthly}</strong>/месяц.
                Провизионирование займет 5-10 минут.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={isProvisioning}
            className="w-full"
            size="lg"
          >
            {isProvisioning ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Провизионирование...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Создать сервер
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• VPS будет создан в выбранном регионе Digital Ocean</p>
            <p>• Автоматически установится V2Ray и необходимые компоненты</p>
            <p>• Сервер будет готов к использованию через 5-10 минут</p>
            <p>• Вы сможете отслеживать прогресс в списке серверов</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 