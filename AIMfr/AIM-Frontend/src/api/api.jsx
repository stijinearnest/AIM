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

const isAuthEndpoint = (url = "") =>
  url.includes("/users/login/") || url.includes("/users/token/refresh/");

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
    const requestUrl = config.url || "";
    const token = localStorage.getItem("access_token");

    // Do not attach stale auth headers to login/refresh requests.
    if (token && !isAuthEndpoint(requestUrl)) {
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
    const isAuthRequest = isAuthEndpoint(requestUrl);

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
