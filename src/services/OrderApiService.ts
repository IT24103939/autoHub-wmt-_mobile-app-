// Order API service

import { apiClient } from "./ApiClient";

export interface OrderItem {
  partId: string;
  supplierId: string;
  partName: string;
  brand?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierStats {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  completedOrders: number;
  pendingOrders: number;
}

class OrderApiService {
  async getMyOrders(): Promise<Order[]> {
    try {
      return await apiClient.get<Order[]>("/orders/my-orders");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupplierOrders(): Promise<Order[]> {
    try {
      return await apiClient.get<Order[]>("/orders/supplier-orders");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupplierStats(): Promise<SupplierStats> {
    try {
      return await apiClient.get<SupplierStats>("/orders/supplier-revenue");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      return await apiClient.get<Order>(`/orders/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createOrder(
    items: OrderItem[],
    customerName: string,
    customerPhone?: string,
    notes?: string
  ): Promise<Order> {
    try {
      return await apiClient.post<Order>("/orders", {
        items,
        customerName,
        customerPhone,
        notes
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      return await apiClient.put<Order>(`/orders/${orderId}`, { status });
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

export default new OrderApiService();
