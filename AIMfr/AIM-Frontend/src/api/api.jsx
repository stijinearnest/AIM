import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshTokenRequest = null;

const clearStoredTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("Refresh token is missing");
  }

  const response = await axios.post("/api/users/token/refresh/", {
    refresh: refreshToken,
  });

  const { access, refresh } = response.data;

  localStorage.setItem("access_token", access);

  if (refresh) {
    localStorage.setItem("refresh_token", refresh);
  }

  return access;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", error.response?.data || error.message);

    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";
    const isAuthRequest =
      requestUrl.includes("/users/login/") ||
      requestUrl.includes("/users/token/refresh/");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshTokenRequest = refreshTokenRequest || refreshAccessToken();
      const accessToken = await refreshTokenRequest;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearStoredTokens();
      return Promise.reject(refreshError);
    } finally {
      refreshTokenRequest = null;
    }
  }
);

export default api;
