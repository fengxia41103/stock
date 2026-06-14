import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("apiKey");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  if (config.url && !config.url.endsWith("/") && !config.url.includes("?")) {
    config.url += "/";
  } else if (
    config.url &&
    config.url.includes("?") &&
    !config.url.split("?")[0].endsWith("/")
  ) {
    const [path, query] = config.url.split("?");
    config.url = `${path}/?${query}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("apiKey");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
