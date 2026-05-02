// Payment API service

import { apiClient } from "./ApiClient";

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  supplierId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  transactionId: string;
  reference: string;
  notes: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStats {
  totalPaymentsPending: number;
  totalPaymentsReceived: number;
  pendingCount: number;
  paidCount: number;
}

class PaymentApiService {
  async getCustomerPayments(): Promise<Payment[]> {
    try {
      return await apiClient.get<Payment[]>("/payments/customer");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupplierPendingPayments(): Promise<Payment[]> {
    try {
      return await apiClient.get<Payment[]>("/payments/supplier/pending");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupplierPaidPayments(): Promise<Payment[]> {
    try {
      return await apiClient.get<Payment[]>("/payments/supplier/paid");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupplierStats(): Promise<PaymentStats> {
    try {
      return await apiClient.get<PaymentStats>("/payments/supplier/stats");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPaymentById(id: string): Promise<Payment> {
    try {
      return await apiClient.get<Payment>(`/payments/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPayment(
    orderId: string,
    paymentMethod: string = "CARD",
    reference?: string,
    notes?: string
  ): Promise<Payment> {
    try {
      return await apiClient.post<Payment>("/payments", {
        orderId,
        paymentMethod,
        reference,
        notes
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async processPayment(paymentId: string): Promise<Payment> {
    try {
      return await apiClient.post<Payment>(`/payments/${paymentId}/process`, {});
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async confirmPaymentReceived(paymentId: string, notes?: string): Promise<Payment> {
    try {
      return await apiClient.put<Payment>(`/payments/${paymentId}/confirm`, { notes });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error && typeof error === "object" && "message" in error) {
      return error as Error;
    }
    return new Error(error?.message || "Unknown error occurred");
  }
}

export default new PaymentApiService();
