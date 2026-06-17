import apiClient from "@/services/apiClient";
import type { OrderDetail } from "@/types/order.types";

function normalizeEndpoint(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const baseURL = (apiClient.defaults.baseURL || "").toLowerCase();
  const isBaseApi = baseURL.endsWith("/api");

  if (isBaseApi && normalizedEndpoint.startsWith("/api/")) {
    return normalizedEndpoint.slice(4);
  }

  if (isBaseApi && normalizedEndpoint === "/api") {
    return "/";
  }

  return normalizedEndpoint;
}

export async function fetchProfileOrder(
  orderId: number,
  authToken: string
): Promise<OrderDetail> {
  const response = await apiClient.get<OrderDetail>(
    normalizeEndpoint(`/api/ui/profile/orders/${orderId}`),
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  return response.data;
}
