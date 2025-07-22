import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { 
  Settings, 
  Mail, 
  Shield, 
  CreditCard
} from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Настройки системы</h1>
        <p className="text-muted-foreground">
          Управление конфигурацией и параметрами системы
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Общие настройки</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="siteName">Название сайта</Label>
              <Input 
                id="siteName" 
                defaultValue="SafeSurf VPN" 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="siteDescription">Описание</Label>
              <Textarea 
                id="siteDescription" 
                defaultValue="Безопасный и быстрый VPN сервис"
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="maintenanceMode" />
              <Label htmlFor="maintenanceMode">Режим обслуживания</Label>
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Настройки платежей</h3>
            <Badge variant="secondary">YooKassa</Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="shopId">Shop ID</Label>
              <Input 
                id="shopId" 
                defaultValue="***"
                type="password"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="secretKey">Secret Key</Label>
              <Input 
                id="secretKey" 
                defaultValue="***"
                type="password"
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="testMode" defaultChecked />
              <Label htmlFor="testMode">Тестовый режим</Label>
            </div>
          </div>
        </Card>

        {/* Email Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Email настройки</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input 
                id="smtpHost" 
                placeholder="smtp.gmail.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input 
                id="smtpPort" 
                type="number"
                placeholder="587"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="fromEmail">Email отправителя</Label>
              <Input 
                id="fromEmail" 
                type="email"
                placeholder="noreply@safesurf.tech"
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Безопасность</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="twoFactor" />
              <Label htmlFor="twoFactor">Двухфакторная аутентификация</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="ipWhitelist" />
              <Label htmlFor="ipWhitelist">Белый список IP для админки</Label>
            </div>
            
            <div>
              <Label htmlFor="sessionTimeout">Таймаут сессии (минуты)</Label>
              <Input 
                id="sessionTimeout" 
                type="number"
                defaultValue="60"
                className="mt-1"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Сохранение настроек</h3>
            <p className="text-sm text-muted-foreground">
              Настройки сохраняются в переменных окружения
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Сбросить</Button>
            <Button>Сохранить изменения</Button>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Внимание:</strong> Функция сохранения настроек будет реализована в следующих версиях. 
            Текущие настройки задаются через переменные окружения.
          </p>
        </div>
      </Card>
    </div>
  );
} 