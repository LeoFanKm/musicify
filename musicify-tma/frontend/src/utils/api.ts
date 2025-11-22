import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiResponse } from '@shared/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://musicify-api.example.workers.dev';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器：添加 Telegram initData
    this.client.interceptors.request.use((config) => {
      const initData = window.Telegram?.WebApp?.initData;
      if (initData) {
        config.headers['X-Telegram-Init-Data'] = initData;
      }
      return config;
    });

    // 响应拦截器：统一处理错误
    this.client.interceptors.response.use(
      (response) => {
        const apiResponse = response.data as ApiResponse;
        if (!apiResponse.success && apiResponse.error) {
          throw new Error(apiResponse.error.message);
        }
        return {
          ...response,
          data: apiResponse.data,
        };
      },
      (error) => {
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error.message);
        }
        throw error;
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<ApiResponse<T>, { data: T }>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<ApiResponse<T>, { data: T }>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<ApiResponse<T>, { data: T }>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<ApiResponse<T>, { data: T }>(url, config);
  }

  async upload(url: string, file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      },
    });
  }
}

export const api = new ApiClient();
