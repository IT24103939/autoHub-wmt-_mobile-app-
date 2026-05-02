// Garage API service

import { apiClient, ApiError } from "./ApiClient";
import { Garage } from "../types/models";

class GarageApiService {
  async getAllGarages(): Promise<Garage[]> {
    try {
      return await apiClient.get<Garage[]>("/garages");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getGarageById(id: string): Promise<Garage> {
    try {
      return await apiClient.get<Garage>(`/garages/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOwnerGarages(): Promise<Garage[]> {
    try {
      return await apiClient.get<Garage[]>("/garages/owner");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createGarage(garage: Garage): Promise<Garage> {
    try {
      return await apiClient.post<Garage>("/garages", garage);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateGarage(id: string, updates: Partial<Garage>): Promise<Garage> {
    try {
      return await apiClient.put<Garage>(`/garages/${id}`, updates);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteGarage(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/garages/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as ApiError;
      return new Error(apiError.message);
    }
    return error instanceof Error ? error : new Error("Unknown error");
  }
}

export const garageApiService = new GarageApiService();
