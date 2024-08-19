import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';

const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  // Implement retry logic
  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay, // This uses the built-in exponential backoff function
    retryCondition: (error: AxiosError) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.response?.status === 429
      );
    },
  });

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      console.error(`API Error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createAxiosInstance;