import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  login as loginApi,
  type LoginRequest,
  type LoginResponse,
  type User,
} from "@/utils/authApi";
import { clearCartSessionId } from "@/utils/cartApi";
import useCartStore from "@/stores/cartStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  apiRequest,
  getTokenExpiryTimestamp,
  isTokenExpired,
  isTokenExpiringSoon,
  refreshAccessToken,
  type AuthRefreshResult,
  type TokenRefreshedEventDetail,
} from "@/utils/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  setAuthSession: (session: LoginResponse) => void;
  logout: () => void;
  refreshAuthToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";
const REFRESH_BEFORE_EXPIRY_SECONDS = 60;
const REFRESH_RETRY_DELAY_MS = 10_000;
const AUTH_QUERY_PREFIXES = new Set([
  "cart",
  "wallet",
  "checkout",
  "payment",
  "profile",
  "orders",
]);

function toStatusError(error: unknown): Error & { status?: number } {
  if (error instanceof Error) {
    return error as Error & { status?: number };
  }

  return new Error("Request failed");
}

function toUser(value: unknown): User | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as User;
}

function isAuthScopedQueryKey(queryKey: readonly unknown[]): boolean {
  const firstSegment = queryKey[0];
  if (typeof firstSegment !== "string") {
    return false;
  }

  return AUTH_QUERY_PREFIXES.has(firstSegment);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current != null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const setAuthSession = useCallback((session: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));

    setToken(session.token);
    setUser(session.user);
  }, []);

  const clearAuthAndCartState = useCallback(
    (options: { clearStorage?: boolean } = {}) => {
      const { clearStorage = true } = options;
      clearRefreshTimer();

      if (clearStorage) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      clearCartSessionId();
      useCartStore.getState().setCart(null);

      void queryClient.cancelQueries({
        predicate: (query) => isAuthScopedQueryKey(query.queryKey),
      });
      queryClient.removeQueries({
        predicate: (query) => isAuthScopedQueryKey(query.queryKey),
      });

      setToken(null);
      setUser(null);
    },
    [clearRefreshTimer, queryClient]
  );

  const fetchCurrentUser = useCallback(async (accessToken: string): Promise<User> => {
    return apiRequest<User>(
      "/api/ui/profile",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      false
    );
  }, []);

  const runRefreshFlow = useCallback(async (): Promise<AuthRefreshResult> => {
    const refreshResult = await refreshAccessToken();
    if (refreshResult.status !== "success") {
      return refreshResult;
    }

    let resolvedUser = toUser(refreshResult.user);
    if (!resolvedUser) {
      try {
        resolvedUser = await fetchCurrentUser(refreshResult.token);
      } catch (error) {
        const parsedError = toStatusError(error);
        const isUnauthorized =
          parsedError.status === 401 || parsedError.status === 403;
        return {
          status: isUnauthorized ? "unauthorized" : "error",
          error: parsedError,
        };
      }
    }

    localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
    setToken(refreshResult.token);
    setUser(resolvedUser);

    return {
      ...refreshResult,
      user: resolvedUser,
    };
  }, [fetchCurrentUser]);

  const refreshAuthToken = useCallback(async () => {
    const refreshResult = await runRefreshFlow();
    if (refreshResult.status === "success") {
      return;
    }

    if (
      refreshResult.status === "unauthorized" ||
      refreshResult.status === "no_refresh_token"
    ) {
      clearAuthAndCartState();
    }

    throw refreshResult.error ?? new Error("Token refresh failed");
  }, [clearAuthAndCartState, runRefreshFlow]);

  const runScheduledRefreshAttempt = useCallback(async () => {
    const refreshResult = await runRefreshFlow();
    if (refreshResult.status === "success") {
      return;
    }

    if (
      refreshResult.status === "unauthorized" ||
      refreshResult.status === "no_refresh_token"
    ) {
      clearAuthAndCartState();
      return;
    }

    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (activeToken && !isTokenExpired(activeToken)) {
      clearRefreshTimer();
      refreshTimerRef.current = window.setTimeout(() => {
        void runScheduledRefreshAttempt();
      }, REFRESH_RETRY_DELAY_MS);
      return;
    }

    clearAuthAndCartState();
  }, [clearAuthAndCartState, clearRefreshTimer, runRefreshFlow]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!storedToken && !storedRefreshToken) {
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
          return;
        }

        if (storedRefreshToken) {
          const refreshResult = await runRefreshFlow();
          if (refreshResult.status === "success") {
            return;
          }

          if (
            refreshResult.status === "unauthorized" ||
            refreshResult.status === "no_refresh_token"
          ) {
            clearAuthAndCartState();
            return;
          }

          if (import.meta.env.DEV) {
            console.warn("[AuthContext] startup refresh failed", refreshResult.error);
          }

          if (storedToken && !isTokenExpired(storedToken)) {
            try {
              const validatedUser = await fetchCurrentUser(storedToken);
              if (!isMounted) {
                return;
              }

              localStorage.setItem(USER_KEY, JSON.stringify(validatedUser));
              setToken(storedToken);
              setUser(validatedUser);
              return;
            } catch (error) {
              if (import.meta.env.DEV) {
                console.warn("[AuthContext] startup profile fallback failed", error);
              }
            }
          }

          setToken(null);
          setUser(null);
          return;
        }

        if (!storedToken || isTokenExpired(storedToken)) {
          clearAuthAndCartState();
          return;
        }

        try {
          const validatedUser = await fetchCurrentUser(storedToken);
          if (!isMounted) {
            return;
          }

          localStorage.setItem(USER_KEY, JSON.stringify(validatedUser));
          setToken(storedToken);
          setUser(validatedUser);
        } catch (error) {
          const refreshError = toStatusError(error);
          const isUnauthorized =
            refreshError.status === 401 || refreshError.status === 403;

          if (isUnauthorized) {
            clearAuthAndCartState();
          } else if (import.meta.env.DEV) {
            console.warn("[AuthContext] profile validation failed", error);
          }

          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        clearAuthAndCartState();
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    };

    void initAuth();

    return () => {
      isMounted = false;
    };
  }, [clearAuthAndCartState, fetchCurrentUser, runRefreshFlow]);

  useEffect(() => {
    let isMounted = true;

    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<TokenRefreshedEventDetail | undefined>;
      const nextToken = customEvent.detail?.token;
      const nextUser = toUser(customEvent.detail?.user);

      if (!nextToken) {
        return;
      }

      setToken(nextToken);

      if (nextUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
        return;
      }

      // Refresh responses may omit user; fetch /profile to keep user state consistent.
      setUser(null);
      void (async () => {
        try {
          const validatedUser = await fetchCurrentUser(nextToken);
          if (!isMounted) {
            return;
          }

          localStorage.setItem(USER_KEY, JSON.stringify(validatedUser));
          setUser(validatedUser);
        } catch (error) {
          const parsedError = toStatusError(error);
          const isUnauthorized =
            parsedError.status === 401 || parsedError.status === 403;
          if (isUnauthorized) {
            clearAuthAndCartState();
          }
        }
      })();
    };

    const handleTokenExpired = () => {
      clearAuthAndCartState({ clearStorage: false });
    };

    window.addEventListener(
      "auth-token-refreshed",
      handleTokenRefreshed as EventListener
    );
    window.addEventListener("auth-token-expired", handleTokenExpired);

    return () => {
      isMounted = false;
      window.removeEventListener(
        "auth-token-refreshed",
        handleTokenRefreshed as EventListener
      );
      window.removeEventListener("auth-token-expired", handleTokenExpired);
    };
  }, [clearAuthAndCartState, fetchCurrentUser]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return;
      }

      if (
        event.key !== TOKEN_KEY &&
        event.key !== REFRESH_TOKEN_KEY &&
        event.key !== USER_KEY &&
        event.key !== null
      ) {
        return;
      }

      const nextToken = localStorage.getItem(TOKEN_KEY);
      const nextRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!nextToken || !nextRefreshToken) {
        clearAuthAndCartState({ clearStorage: false });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [clearAuthAndCartState]);

  useEffect(() => {
    clearRefreshTimer();

    if (!token) {
      return;
    }

    if (isTokenExpiringSoon(token, REFRESH_BEFORE_EXPIRY_SECONDS)) {
      void runScheduledRefreshAttempt();
      return;
    }

    const expiryTimestamp = getTokenExpiryTimestamp(token);
    if (expiryTimestamp == null) {
      return;
    }

    const delayMs = Math.max(
      expiryTimestamp - Date.now() - REFRESH_BEFORE_EXPIRY_SECONDS * 1000,
      0
    );

    refreshTimerRef.current = window.setTimeout(() => {
      void runScheduledRefreshAttempt();
    }, delayMs);

    return () => {
      clearRefreshTimer();
    };
  }, [clearRefreshTimer, runScheduledRefreshAttempt, token]);

  const login = async (credentials: LoginRequest) => {
    setIsAuthenticating(true);
    try {
      const response: LoginResponse = await loginApi(credentials);
      setAuthSession(response);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    clearAuthAndCartState();
  };

  const isLoading = isHydrating || isAuthenticating;

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    setAuthSession,
    logout,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
