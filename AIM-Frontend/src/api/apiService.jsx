import api from "./api";

export const apiGet = async (url, params = {}) => {
  const response = await api.get(url, {
    params: {
      ...params,
      _ts: Date.now(),
    },
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
  return response.data;
};

export const apiPost = async (url, data = {}) => {
  const response = await api.post(url, data);
  return response.data;
};

export const apiPut = async (url, data = {}) => {
  const response = await api.put(url, data);
  return response.data;
};

export const apiPatch = async (url, data = {}) => {
  const response = await api.patch(url, data);
  return response.data;
};

export const apiDelete = async (url) => {
  const response = await api.delete(url);
  return response.data;
};
