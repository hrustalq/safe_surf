import { env } from "~/env";

export interface YooKassaPayment {
  id: string;
  status: string;
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: string;
    confirmation_url: string;
  };
  metadata?: Record<string, string>;
}

export interface CreatePaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: "redirect";
    return_url: string;
  };
  capture: boolean;
  description: string;
  metadata?: Record<string, string>;
}

class YooKassaService {
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly baseUrl = "https://api.yookassa.ru/v3";

  constructor() {
    if (!env.YOOKASSA_SHOP_ID || !env.YOOKASSA_SECRET_KEY) {
      throw new Error("YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY environment variables are required");
    }
    this.shopId = env.YOOKASSA_SHOP_ID;
    this.secretKey = env.YOOKASSA_SECRET_KEY;
  }

  private getAuthHeader(): string {
    // YooKassa uses Basic auth with shop_id as username and secret_key as password
    const credentials = Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');
    return `Basic ${credentials}`;
  }

  private generateIdempotenceKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  async createPayment(paymentData: CreatePaymentRequest): Promise<YooKassaPayment> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: "POST",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Idempotence-Key": this.generateIdempotenceKey(),
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json() as unknown;
      console.error("YooKassa API Error:", error);
      throw new Error(`YooKassa payment creation failed: ${JSON.stringify(error)}`);
    }

    const result = await response.json() as YooKassaPayment;
    console.log("YooKassa payment created:", result.id);
    return result;
  }

  async getPayment(paymentId: string): Promise<YooKassaPayment> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json() as unknown;
      throw new Error(`YooKassa payment retrieval failed: ${JSON.stringify(error)}`);
    }

    return response.json() as unknown as YooKassaPayment;
  }

  async capturePayment(paymentId: string, amount?: { value: string; currency: string }): Promise<YooKassaPayment> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Idempotence-Key": this.generateIdempotenceKey(),
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(amount ? { amount } : {}),
    });

    if (!response.ok) {
      const error = await response.json() as unknown;
      throw new Error(`YooKassa payment capture failed: ${JSON.stringify(error)}`);
    }

    return response.json() as unknown as YooKassaPayment;
  }

  async cancelPayment(paymentId: string): Promise<YooKassaPayment> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Idempotence-Key": this.generateIdempotenceKey(),
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json() as unknown;
      throw new Error(`YooKassa payment cancellation failed: ${JSON.stringify(error)}`);
    }

    return response.json() as unknown as YooKassaPayment;
  }
}

export const yooKassa = new YooKassaService(); 