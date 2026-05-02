import { apiClient } from "./ApiClient";

export interface PaymentMethod {
  id: string;
  userId: string;
  type: "CARD" | "BANK_TRANSFER" | "WALLET";
  name: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  routingNumber?: string;
  walletAddress?: string;
  walletType?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class PaymentMethodApiService {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await apiClient.get<PaymentMethod[]>("/payment-methods");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    try {
      return await apiClient.get<PaymentMethod>(`/payment-methods/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addPaymentMethod(data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      return await apiClient.post<PaymentMethod>("/payment-methods", data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePaymentMethod(id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      return await apiClient.put<PaymentMethod>(`/payment-methods/${id}`, data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePaymentMethod(id: string): Promise<void> {
    try {
      await apiClient.delete(`/payment-methods/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    console.error("PaymentMethod API Error:", error);
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error("Failed to process payment method request");
  }
}

export default new PaymentMethodApiService();
