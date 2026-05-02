// Supplier API service

import { apiClient, ApiError } from "./ApiClient";
import { SparePart } from "../types/models";

class SupplierApiService {
  async getAllSpareParts(): Promise<SparePart[]> {
    try {
      return await apiClient.get<SparePart[]>("/spare-parts");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSparePartById(id: string): Promise<SparePart> {
    try {
      return await apiClient.get<SparePart>(`/spare-parts/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSupplierSpareParts(supplierId: string): Promise<SparePart[]> {
    try {
      return await apiClient.get<SparePart[]>(`/spare-parts/supplier/${supplierId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyInventory(): Promise<SparePart[]> {
    try {
      return await apiClient.get<SparePart[]>("/spare-parts/my-inventory");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createSparePart(sparePart: Omit<SparePart, "id">): Promise<SparePart> {
    try {
      console.log("[SupplierApiService.createSparePart] Request payload:", sparePart);
      const response = await apiClient.post<SparePart>("/spare-parts", sparePart);
      console.log("[SupplierApiService.createSparePart] Response:", response);
      return response;
    } catch (error) {
      console.error("[SupplierApiService.createSparePart] Error:", error);
      throw this.handleError(error);
    }
  }

  async updateSparePart(id: string, updates: Partial<SparePart>): Promise<SparePart> {
    try {
      return await apiClient.put<SparePart>(`/spare-parts/${id}`, updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteSparePart(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/spare-parts/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error && typeof error === 'object' && 'message' in error) {
      return error as Error;
    }
    return new Error(error?.message || "Unknown error occurred");
  }
}

export default new SupplierApiService();
