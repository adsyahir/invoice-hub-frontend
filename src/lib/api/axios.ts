import axios from "axios";
import { useAuthStore } from "../../stores/auth-store";

const instance = axios.create({
  baseURL: import.meta.env.BACKEND_URL + "/api",
  timeout: 5000,
  withCredentials: true, // needed so the refreshToken cookie is sent
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await instance.post("/refresh");
        useAuthStore.getState().setToken(data.token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return instance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { instance };