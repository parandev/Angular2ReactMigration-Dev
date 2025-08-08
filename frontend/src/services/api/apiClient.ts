import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import appConfig from '../../utils/appConfig';
import { consoledebug } from '../../utils/debug';

axios.defaults.baseURL = appConfig.API_BASE_URL;

// Enhanced error type for better error handling
export interface ApiError {
    message: string;
    status?: number;
    isNetworkError: boolean;
    isTimeout: boolean;
    originalError?: any;
}

class ApiClient {
    private static instance: ApiClient;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create({
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor for any auth headers or common modifications
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Add any auth tokens or headers here
                return config;
            },
            (error) => {
                return Promise.reject(this.createApiError(error));
            }
        );

        // Enhanced response interceptor for better error handling
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                return Promise.reject(this.createApiError(error));
            }
        );
    }

    private createApiError(error: any): ApiError {
        // Network error (no response received)
        if (!error.response) {
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                return {
                    message: 'Request timed out. Please check your connection and try again.',
                    isNetworkError: false,
                    isTimeout: true,
                    originalError: error
                };
            }
            return {
                message: 'Network error. Please check your connection and try again.',
                isNetworkError: true,
                isTimeout: false,
                originalError: error
            };
        }

        // Server responded with error status
        const status = error.response.status;
        let message = 'An error occurred while loading data.';

        switch (status) {
            case 400:
                message = 'Invalid request. Please check your filters and try again.';
                break;
            case 401:
                message = 'Authentication required. Please log in and try again.';
                break;
            case 403:
                message = 'Access denied. You don\'t have permission to access this data.';
                break;
            case 404:
                message = 'Data not found. The requested information may not be available.';
                break;
            case 500:
                message = 'Server error. Please try again later.';
                break;
            case 502:
            case 503:
            case 504:
                message = 'Service temporarily unavailable. Please try again later.';
                break;
            default:
                message = `Server returned error ${status}. Please try again.`;
        }

        return {
            message,
            status,
            isNetworkError: false,
            isTimeout: false,
            originalError: error
        };
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.get<T>(url, config);
            consoledebug('API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.axiosInstance.post<T>(url, data, config);
            consoledebug('API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    }
}

export const apiClient = ApiClient.getInstance(); 