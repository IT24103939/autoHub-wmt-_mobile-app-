// API configuration and base client for all HTTP calls

import { errorLogger } from "../utils/errorLogger";


// Live Render deployment URL
const API_BASE_URL = "https://mobile-app-backend-i1rk.onrender.com/api";

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

class ApiClientClass {
  private baseURL: string;
  private timeout: number;
  private userToken: string | null = null;
  private userId: string | null = null;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 60000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  setAuthHeaders(userId: string, token?: string) {
    this.userId = userId;
    if (token) {
      this.userToken = token;
    }
  }

  clearAuth() {
    this.userId = null;
    this.userToken = null;
  }

  private getHeaders(additionalHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...additionalHeaders
    };

    if (this.userId) {
      headers["X-User-Id"] = this.userId;
    }

    if (this.userToken) {
      headers["Authorization"] = `Bearer ${this.userToken}`;
    }

    return headers;
  }

  async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(additionalHeaders);

    try {
      const options: RequestInit = {
        method,
        headers
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      // Use a longer timeout for large requests (like images)
      const requestTimeout = data ? 120000 : this.timeout; // 2 minutes for uploads, default for others

      // Use Promise.race instead of AbortController to avoid React Native RangeError bug
      // Use a more standard fetch pattern for React Native to avoid polyfill bugs
      const response = await Promise.race([
        fetch(url, options),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), requestTimeout);
        })
      ]);

      if (!(response instanceof Response)) {
         throw new Error("Invalid response received");
      }

      if (!response.ok) {
        const errorData = await this.parseResponse(response);
        throw {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          details: errorData.details
        } as ApiError;
      }

      return await this.parseResponse(response);
    } catch (error: any) {
      // Log all network errors
      errorLogger.log(error, "network", endpoint);
      
      // Handle the specific RangeError if it bubbled up
      const errorMessage = error?.message || String(error);
      const isRangeError = errorMessage.includes("status provided (0)");

      // Only use console.error for actual network failures, not HTTP error responses
      if (error.status) {
        console.log("[API Error]", {
          url,
          method,
          status: error.status,
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
      } else {
        console.error("[Network Error]", {
          url,
          method,
          error: isRangeError ? "Polyfill RangeError (Status 0)" : errorMessage,
          timestamp: new Date().toISOString()
        });
      }

      if (error instanceof TypeError || isRangeError) {
        throw {
          status: 0,
          message: "Network error: " + (isRangeError ? "Connection interrupted" : errorMessage)
        } as ApiError;
      }

      // Handle other errors
      if (error.status && error.message) {
        throw error; // Already formatted ApiError
      }

      throw {
        status: 0,
        message: errorMessage || "Unknown network error"
      } as ApiError;
    }
  }

  private async parseResponse(response: Response): Promise<any> {
    const text = await response.text();
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      try {
        return text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn("[API] Failed to parse JSON response:", text);
        return { message: text || response.statusText };
      }
    }
    return { message: text || response.statusText };
  }

  get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>("GET", endpoint, undefined, headers);
  }

  post<T>(endpoint: string, data: unknown, headers?: Record<string, string>) {
    return this.request<T>("POST", endpoint, data, headers);
  }

  put<T>(endpoint: string, data: unknown, headers?: Record<string, string>) {
    return this.request<T>("PUT", endpoint, data, headers);
  }

  patch<T>(endpoint: string, data?: unknown, headers?: Record<string, string>) {
    return this.request<T>("PATCH", endpoint, data, headers);
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>("DELETE", endpoint, undefined, headers);
  }
}

export const ApiClient = new ApiClientClass();
export const apiClient = ApiClient;
