"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

interface SubscribeButtonProps {
  planId: string;
  isPopular: boolean;
}

export function SubscribeButton({ planId, isPopular }: SubscribeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const createPaymentMutation = api.subscription.createPayment.useMutation({
    onSuccess: (data) => {
      // Redirect to YooKassa payment page
      window.location.href = data.confirmationUrl;
    },
    onError: (error) => {
      console.error("Payment creation error:", error);
      alert(error.message);
      setIsLoading(false);
    },
  });

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await createPaymentMutation.mutateAsync({ planId });
    } catch {
      // Error handled in onError callback
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`w-full ${
        isPopular ? "bg-primary hover:bg-primary/90" : ""
      }`}
      variant={isPopular ? "default" : "outline"}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Создание платежа...
        </>
      ) : (
        "Выбрать план"
      )}
    </Button>
  );
} 