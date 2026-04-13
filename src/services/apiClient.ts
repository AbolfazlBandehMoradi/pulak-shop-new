import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const getBaseURL = () => {
  if (rawApiUrl) {
    return normalizeBaseUrl(rawApiUrl);
  }

  if (rawApiBaseUrl) {
    return `${normalizeBaseUrl(rawApiBaseUrl)}/api`;
  }

  return "http://localhost:5299/api";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: { "Content-Type": "application/json" },
});

export default apiClient;
