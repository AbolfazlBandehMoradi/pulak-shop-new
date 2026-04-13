
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Mail,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";
import { useTranslation } from "@/i18n/useTranslation";
import { useLangStore } from "@/stores/languageStore";
import { formatPrice } from "@/utils/numberFormat";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileData {
  id?: number;
  username?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  mobile?: string | null;
  phoneNumber?: string | null;
  roles?: string[] | null;
  [key: string]: unknown;
}

interface ProfileOrder {
  id?: number | string;
  orderNumber?: string;
  status?: string;
  createdAt?: string;
  totalAmount?: number | string;
  finalAmount?: number | string;
  total?: number | string;
  currencySymbol?: string;
  itemCount?: number | string;
  itemsCount?: number | string;
  [key: string]: unknown;
}

type OrdersResponse =
  | ProfileOrder[]
  | {
      items?: ProfileOrder[];
      orders?: ProfileOrder[];
      data?: ProfileOrder[];
      result?: ProfileOrder[];
      totalCount?: number;
      pageNumber?: number;
      pageSize?: number;
      totalPages?: number;
      hasPreviousPage?: boolean;
      hasNextPage?: boolean;
    };

interface OrdersMeta {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const EMPTY_ORDERS_META: OrdersMeta = {
  totalCount: 0,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

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

function extractOrders(payload: OrdersResponse): ProfileOrder[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.orders)) {
    return payload.orders;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.result)) {
    return payload.result;
  }

  return [];
}

function normalizeOrdersResponse(payload: OrdersResponse | null | undefined): {
  items: ProfileOrder[];
  meta: OrdersMeta;
} {
  if (!payload) {
    return { items: [], meta: EMPTY_ORDERS_META };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: {
        ...EMPTY_ORDERS_META,
        totalCount: payload.length,
        pageSize: payload.length || EMPTY_ORDERS_META.pageSize,
        totalPages: payload.length > 0 ? 1 : 0,
      },
    };
  }

  const items = extractOrders(payload);
  const pageSize =
    typeof payload.pageSize === "number" && payload.pageSize > 0
      ? payload.pageSize
      : EMPTY_ORDERS_META.pageSize;
  const pageNumber =
    typeof payload.pageNumber === "number" && payload.pageNumber > 0
      ? payload.pageNumber
      : EMPTY_ORDERS_META.pageNumber;
  const totalCount =
    typeof payload.totalCount === "number" && payload.totalCount >= 0
      ? payload.totalCount
      : items.length;
  const fallbackTotalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const totalPages =
    typeof payload.totalPages === "number" && payload.totalPages >= 0
      ? payload.totalPages
      : fallbackTotalPages;

  return {
    items,
    meta: {
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPreviousPage:
        typeof payload.hasPreviousPage === "boolean"
          ? payload.hasPreviousPage
          : pageNumber > 1,
      hasNextPage:
        typeof payload.hasNextPage === "boolean"
          ? payload.hasNextPage
          : totalPages > 0 && pageNumber < totalPages,
    },
  };
}

function toNumericValue(value: number | string | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

const ProfilePage = () => {
  const { token, user, logout } = useAuth();
  const currentLanguage = useLangStore((s) => s.lang);
  const { t } = useTranslation();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [ordersMeta, setOrdersMeta] = useState<OrdersMeta>(EMPTY_ORDERS_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tRef = useRef(t);
  const logoutRef = useRef(logout);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  const translateOr = useCallback(
    (key: string, fallback: string) => {
      const translated = t(key);
      return translated && translated !== key ? translated : fallback;
    },
    [t]
  );

  const translateRefOr = useCallback((key: string, fallback: string) => {
    const translated = tRef.current(key);
    return translated && translated !== key ? translated : fallback;
  }, []);

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const authToken = token || localStorage.getItem("auth_token");
      if (!authToken) {
        throw new Error(
          translateRefOr("login.error.unauthorized", "Authentication required")
        );
      }

      const headers = { Authorization: `Bearer ${authToken}` };

      const [profileResponse, ordersResponse] = await Promise.all([
        apiClient.get<ProfileData>(normalizeEndpoint("/api/ui/profile"), { headers }),
        apiClient.get<OrdersResponse>(normalizeEndpoint("/api/ui/profile/orders"), {
          headers,
        }),
      ]);
      const normalizedOrders = normalizeOrdersResponse(ordersResponse.data);

      setProfile(profileResponse.data ?? null);
      setOrders(normalizedOrders.items);
      setOrdersMeta(normalizedOrders.meta);
    } catch (err: unknown) {
      console.error("Failed to load profile data:", err);

      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logoutRef.current();
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : translateRefOr("profile.error.loadFailed", "Failed to load profile data")
      );
    } finally {
      setLoading(false);
    }
  }, [token, translateRefOr]);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  const displayName = useMemo(() => {
    const firstName = (profile?.firstName || user?.firstName || "").trim();
    const lastName = (profile?.lastName || user?.lastName || "").trim();
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    return profile?.username || user?.username || translateOr("profile.defaultName", "User");
  }, [profile, translateOr, user]);

  const rawEmail = (profile?.email || user?.email || "").trim();
  const isGeneratedEmail = rawEmail.endsWith("@mobile.local");
  const email = rawEmail
    ? isGeneratedEmail
      ? translateOr("profile.emailMissing", "No email added yet")
      : rawEmail
    : translateOr("profile.emailMissing", "No email added yet");

  const inferredPhoneFromUsername = useMemo(() => {
    const username = (profile?.username || user?.username || "").trim();
    return /^09\d{9}$/.test(username) ? username : "";
  }, [profile?.username, user?.username]);

  const rawPhone =
    (profile?.mobile || profile?.phoneNumber || inferredPhoneFromUsername || "").trim();
  const phone = rawPhone || translateOr("profile.phoneMissing", "No phone number added yet");

  const roles = useMemo(() => {
    const profileRoles = Array.isArray(profile?.roles) ? profile.roles : [];
    const userRoles = Array.isArray(user?.roles) ? user.roles : [];
    return (profileRoles.length > 0 ? profileRoles : userRoles).filter(
      (role): role is string => typeof role === "string" && role.trim().length > 0
    );
  }, [profile?.roles, user?.roles]);

  const isNameMissing =
    !(profile?.firstName || user?.firstName) && !(profile?.lastName || user?.lastName);
  const hasNoOrders = ordersMeta.totalCount === 0;

  const formatOrderDate = (value?: string) => {
    if (!value) {
      return "-";
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleDateString(currentLanguage === "fa" ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <UserCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {translateOr("profile.title", "My Profile")}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <ShieldCheck className="h-4 w-4" />
                  {translateOr("profile.subtitle", "Account details and recent orders")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-red-600 dark:text-red-400 text-lg font-medium">
                {error}
              </p>
              <Button onClick={() => void loadProfileData()} className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                {translateOr("common.retry", "Retry")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-4 border rounded-lg p-6 bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <UserCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {profile?.username || user?.username || "-"}
                  </p>
                </div>
              </div>

              {isNameMissing && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                  {translateOr(
                    "profile.nameMissing",
                    "Your first and last name are not set yet."
                  )}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{phone}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    {translateOr("profile.roles", "Roles")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        >
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {translateOr(
                          "profile.noRoles",
                          "No roles are assigned to this account yet."
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8 border rounded-lg p-6 bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-linear-to-br from-indigo-500 to-blue-600 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">
                  {translateOr("profile.recentOrders", "Recent Orders")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {ordersMeta.totalCount} {translateOr("profile.totalOrders", "total orders")}
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-4">
                    <Package className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-muted-foreground">
                    {hasNoOrders
                      ? translateOr("profile.noOrders", "You have no orders yet.")
                      : translateOr(
                          "profile.emptyOrdersPage",
                          "No orders were found on this page."
                        )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {hasNoOrders
                      ? translateOr(
                          "profile.noOrdersHint",
                          "After your first purchase, your order history will appear here."
                        )
                      : translateOr(
                          "profile.emptyOrdersPageHint",
                          `There are ${ordersMeta.totalCount} orders in total.`
                        )}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order, index) => {
                    const amount = toNumericValue(
                      order.finalAmount ?? order.totalAmount ?? order.total
                    );
                    const count = toNumericValue(order.itemsCount ?? order.itemCount);

                    return (
                      <motion.div
                        key={String(order.orderNumber ?? order.id ?? index)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-lg border p-4 bg-white dark:bg-gray-900/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {translateOr("profile.orderId", "Order")}
                            </p>
                            <p className="font-semibold">
                              #{order.orderNumber || order.id || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              {translateOr("profile.status", "Status")}
                            </p>
                            <p className="font-medium">{order.status || "-"}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              {translateOr("profile.date", "Date")}
                            </p>
                            <p className="font-medium">{formatOrderDate(order.createdAt)}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              {translateOr("profile.items", "Items")}
                            </p>
                            <p className="font-medium">{count}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              {translateOr("profile.total", "Total")}
                            </p>
                            <p className="font-semibold text-blue-700 dark:text-blue-300">
                              {formatPrice(
                                amount,
                                order.currencySymbol,
                                currentLanguage,
                                currentLanguage === "fa"
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
