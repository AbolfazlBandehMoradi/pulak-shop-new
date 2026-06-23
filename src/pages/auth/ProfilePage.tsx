
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Eye,
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
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { OrderDetailModal } from "@/components/profile/OrderDetailModal";
import { OrderInvoicePrintButton } from "@/components/prints";
import type { OrderDetail } from "@/types/order.types";
import { fetchProfileOrder } from "@/utils/profileOrderApi";
import { orderStatusTone, translateOrderStatus } from "@/utils/orderDetailHelpers";
import getImageUrl from "@/utils/getImageUrl";

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
  orderStatus?: string;
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

function resolveOrderId(order: ProfileOrder): number | null {
  if (typeof order.id === "number" && Number.isFinite(order.id)) {
    return order.id;
  }

  if (typeof order.id === "string" && /^\d+$/.test(order.id)) {
    return Number.parseInt(order.id, 10);
  }

  return null;
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
  const dir = useLangStore((s) => s.dir);
  const { t } = useTranslation();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [ordersMeta, setOrdersMeta] = useState<OrdersMeta>(EMPTY_ORDERS_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [orderCache, setOrderCache] = useState<Record<number, OrderDetail>>({});
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
      const authToken = token;
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
  const username = profile?.username || user?.username || "-";
  const accountInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const recentOrdersTotal = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + toNumericValue(order.finalAmount ?? order.totalAmount ?? order.total),
        0
      ),
    [orders]
  );
  const recentItemsCount = useMemo(
    () =>
      orders.reduce((sum, order) => sum + toNumericValue(order.itemsCount ?? order.itemCount), 0),
    [orders]
  );
  const completedVisibleOrders = useMemo(
    () =>
      orders.filter((order) =>
        ["Completed", "Delivered"].includes(String(order.orderStatus || order.status || ""))
      ).length,
    [orders]
  );
  const profileCompletionSteps = [
    !isNameMissing,
    Boolean(rawEmail && !isGeneratedEmail),
    Boolean(rawPhone),
  ].filter(Boolean).length;

  const locale = currentLanguage === "fa" ? "fa-IR" : "en-US";
  const resolveImageUrl = (path: string) => getImageUrl(path) ?? path;

  const cacheOrder = useCallback((order: OrderDetail) => {
    setOrderCache((prev) => ({ ...prev, [order.id]: order }));
  }, []);

  const fetchAndCacheOrder = useCallback(
    async (orderId: number): Promise<OrderDetail | null> => {
      if (orderCache[orderId]) {
        return orderCache[orderId];
      }

      if (!token) {
        return null;
      }

      try {
        const data = await fetchProfileOrder(orderId, token);
        cacheOrder(data);
        return data;
      } catch (err) {
        console.error("Failed to fetch order for print:", err);
        return null;
      }
    },
    [cacheOrder, orderCache, token]
  );

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
    <div className="min-h-screen">
      <main dir={dir} className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:py-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 overflow-hidden rounded-3xl border border-first-100/80 bg-color-for-layer-on-body shadow-dark-sm"
        >
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-r from-first-100/80 via-first-50/60 to-secound-100/70 dark:from-first-950/40 dark:via-first-900/20 dark:to-secound-950/20" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-first to-first-700 text-xl font-s-sbold text-white shadow-first-sm sm:h-20 sm:w-20 sm:text-2xl">
                  {accountInitials || <UserCircle2 className="h-9 w-9" />}
                </div>
                <div className="min-w-0">
                  <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-first/20 bg-first/10 px-3 py-1 text-xs font-f-sbold text-first">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {translateOr("profile.accountCenter", "Account center")}
                  </p>
                  <h1 className="truncate text-2xl font-s-sbold first-text-color sm:text-3xl">
                    {translateOr("profile.title", "My Profile")}
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm first-text-color-for-paragraph sm:text-base">
                    {translateOr("profile.subtitle", "Account details and recent orders")}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => void loadProfileData()}
                className="w-full gap-2 rounded-xl border border-first/25 bg-color-for-layer-on-body px-4 text-first hover:bg-first hover:text-white sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                {translateOr("profile.refresh", "Refresh")}
              </Button>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-12">
            <Skeleton className="h-80 rounded-3xl lg:col-span-4" />
            <div className="space-y-4 lg:col-span-8">
              <Skeleton className="h-24 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </div>
          </div>
        ) : error ? (
          <section className="rounded-3xl border border-red-200/70 bg-color-for-layer-on-body p-8 text-center shadow-dark-sm dark:border-red-900/50">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="mx-auto mt-4 max-w-xl text-base font-f-sbold text-red-600 dark:text-red-300">
              {error}
            </p>
            <Button
              onClick={() => void loadProfileData()}
              className="mt-5 gap-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              {translateOr("common.retry", "Retry")}
            </Button>
          </section>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-first-100/80 bg-color-for-layer-on-body p-4 shadow-dark-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-first/10 text-first">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-color-for-layer-sec px-2.5 py-1 text-xs first-text-color-for-paragraph-low">
                    {translateOr("profile.totalOrders", "total orders")}
                  </span>
                </div>
                <p className="text-2xl font-s-sbold first-text-color">
                  {ordersMeta.totalCount}
                </p>
                <p className="mt-1 text-sm first-text-color-for-paragraph">
                  {translateOr("profile.orderHistory", "Order history")}
                </p>
              </div>

              <div className="rounded-2xl border border-first-100/80 bg-color-for-layer-on-body p-4 shadow-dark-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-secound-100 text-secound-700">
                    <ClipboardList className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-color-for-layer-sec px-2.5 py-1 text-xs first-text-color-for-paragraph-low">
                    {orders.length} {translateOr("profile.visible", "visible")}
                  </span>
                </div>
                <p className="text-2xl font-s-sbold first-text-color">{recentItemsCount}</p>
                <p className="mt-1 text-sm first-text-color-for-paragraph">
                  {translateOr("profile.itemsInRecentOrders", "Items in recent orders")}
                </p>
              </div>

              <div className="rounded-2xl border border-first-100/80 bg-color-for-layer-on-body p-4 shadow-dark-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-color-for-layer-sec px-2.5 py-1 text-xs first-text-color-for-paragraph-low">
                    {completedVisibleOrders} {translateOr("profile.completed", "completed")}
                  </span>
                </div>
                <p className="text-2xl font-s-sbold text-first">
                  <PriceDisplay
                    amount={recentOrdersTotal}
                    currencyMode="none"
                    languageCode={currentLanguage}
                    valueClassName="font-s-sbold"
                  />
                </p>
                <p className="mt-1 text-sm first-text-color-for-paragraph">
                  {translateOr("profile.recentOrdersTotal", "Recent orders total")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <motion.aside
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-4"
              >
                <section className="overflow-hidden rounded-3xl border border-first-100/80 bg-color-for-layer-on-body shadow-dark-sm">
                  <div className="bg-linear-to-br from-first/15 via-first-50/70 to-secound-50/80 p-5 dark:from-first-900/30 dark:via-first-950/20 dark:to-secound-950/20">
                    <div className="flex items-center gap-4">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-color-for-layer-on-body text-xl font-s-sbold text-first shadow-dark-sm">
                        {accountInitials || <UserCircle2 className="h-8 w-8" />}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-s-sbold first-text-color">
                          {displayName}
                        </h2>
                        <p className="truncate text-sm first-text-color-for-paragraph">
                          {username}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-5">
                    {isNameMissing && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/70 dark:bg-amber-900/20 dark:text-amber-200">
                        {translateOr(
                          "profile.nameMissing",
                          "Your first and last name are not set yet."
                        )}
                      </div>
                    )}

                    <div>
                      <p className="mb-3 text-xs font-f-sbold uppercase tracking-wide first-text-color-for-paragraph-low">
                        {translateOr("profile.contact", "Contact")}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 rounded-2xl bg-color-for-layer-sec px-3 py-3">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-first" />
                          <span className="min-w-0 break-words text-sm first-text-color-for-paragraph">
                            {email}
                          </span>
                        </div>
                        <div className="flex items-start gap-3 rounded-2xl bg-color-for-layer-sec px-3 py-3">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-first" />
                          <span className="min-w-0 break-words text-sm first-text-color-for-paragraph">
                            {phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-f-sbold uppercase tracking-wide first-text-color-for-paragraph-low">
                          {translateOr("profile.profileStatus", "Profile status")}
                        </p>
                        <span className="text-xs font-f-sbold text-first">
                          {profileCompletionSteps}/3
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-color-for-layer-sec">
                        <div
                          className="h-full rounded-full bg-first transition-all duration-500"
                          style={{ width: `${(profileCompletionSteps / 3) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-f-sbold uppercase tracking-wide first-text-color-for-paragraph-low">
                        {translateOr("profile.roles", "Roles")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full border border-first/20 bg-first/10 px-3 py-1 text-xs font-f-sbold text-first"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm first-text-color-for-paragraph-low">
                            {translateOr(
                              "profile.noRoles",
                              "No roles are assigned to this account yet."
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </motion.aside>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="rounded-3xl border border-first-100/80 bg-color-for-layer-on-body p-4 shadow-dark-sm sm:p-5 lg:col-span-8"
              >
                <div className="mb-5 flex flex-col gap-3 border-b border-gray-300/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-first text-white shadow-first-sm">
                      <ShoppingBag className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-xl font-s-sbold first-text-color">
                        {translateOr("profile.recentOrders", "Recent Orders")}
                      </h2>
                      <p className="text-sm first-text-color-for-paragraph-low">
                        {ordersMeta.totalCount}{" "}
                        {translateOr("profile.totalOrders", "total orders")}
                      </p>
                    </div>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-first-100/80 bg-color-for-layer-sec px-5 py-12 text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-color-for-layer-on-body text-first shadow-dark-sm">
                      <Package className="h-8 w-8" />
                    </div>
                    <p className="mt-4 font-f-sbold first-text-color">
                      {hasNoOrders
                        ? translateOr("profile.noOrders", "You have no orders yet.")
                        : translateOr(
                            "profile.emptyOrdersPage",
                            "No orders were found on this page."
                          )}
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-sm first-text-color-for-paragraph-low">
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
                      const orderId = resolveOrderId(order);
                      const cachedOrder = orderId ? orderCache[orderId] : undefined;
                      const displayStatus = String(order.orderStatus || order.status || "");

                      return (
                        <motion.article
                          key={String(order.orderNumber ?? order.id ?? index)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="group overflow-hidden rounded-2xl border border-first-100/80 bg-color-for-layer-sec transition-all duration-300 hover:border-first/35 hover:shadow-[0_16px_34px_-24px_rgba(27,126,251,0.65)]"
                        >
                          <div className="grid gap-4 p-4 md:grid-cols-[1.2fr_1fr_auto] md:items-center">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-color-for-layer-on-body text-first shadow-dark-sm">
                                <Package className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs first-text-color-for-paragraph-low">
                                  {translateOr("profile.orderId", "Order")}
                                </p>
                                <p className="truncate text-base font-s-sbold first-text-color">
                                  #{order.orderNumber || order.id || "-"}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3">
                              <div>
                                <p className="mb-1 text-xs first-text-color-for-paragraph-low">
                                  {translateOr("profile.status", "Status")}
                                </p>
                                <span
                                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-f-sbold ${
                                    displayStatus
                                      ? orderStatusTone(displayStatus)
                                      : "border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                  }`}
                                >
                                  {displayStatus
                                    ? translateOrderStatus(displayStatus, t)
                                    : "-"}
                                </span>
                              </div>

                              <div>
                                <p className="mb-1 text-xs first-text-color-for-paragraph-low">
                                  {translateOr("profile.date", "Date")}
                                </p>
                                <p className="flex items-center gap-1.5 text-sm font-f-sbold first-text-color">
                                  <CalendarDays className="h-3.5 w-3.5 text-first" />
                                  {formatOrderDate(order.createdAt)}
                                </p>
                              </div>

                              <div>
                                <p className="mb-1 text-xs first-text-color-for-paragraph-low">
                                  {translateOr("profile.items", "Items")}
                                </p>
                                <p className="text-sm font-f-sbold first-text-color">{count}</p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-gray-300/40 pt-4 md:border-0 md:pt-0">
                              <div className="text-start md:text-end">
                                <p className="text-xs first-text-color-for-paragraph-low">
                                  {translateOr("profile.total", "Total")}
                                </p>
                                <p className="text-lg font-s-sbold text-first">
                                  <PriceDisplay
                                    amount={amount}
                                    currency={order.currencySymbol}
                                    currencyMode="none"
                                    languageCode={currentLanguage}
                                    valueClassName="font-s-sbold"
                                  />
                                </p>
                              </div>

                              {orderId && (
                                <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2 rounded-xl border-first/40 text-first hover:bg-first hover:text-white sm:w-auto"
                                    onClick={() => setDetailOrderId(orderId)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    {translateOr("profile.viewDetails", "View details")}
                                    <ChevronRight
                                      className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`}
                                    />
                                  </Button>
                                  <OrderInvoicePrintButton
                                    order={cachedOrder ?? null}
                                    onRequestOrder={() => fetchAndCacheOrder(orderId)}
                                    dir={dir}
                                    locale={locale}
                                    languageCode={currentLanguage}
                                    t={t}
                                    label={translateOr("profile.printInvoice", "Print invoice")}
                                    resolveImageUrl={resolveImageUrl}
                                    className="w-full gap-2 rounded-xl border-first/30 text-first hover:bg-first hover:text-white sm:w-auto"
                                    size="sm"
                                    variant="outline"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            </div>
          </>
        )}
      </main>

      <OrderDetailModal
        orderId={detailOrderId}
        isOpen={detailOrderId != null}
        onClose={() => setDetailOrderId(null)}
        authToken={token}
        cachedOrder={detailOrderId ? orderCache[detailOrderId] : null}
        onOrderLoaded={cacheOrder}
      />
    </div>
  );
};

export default ProfilePage;
