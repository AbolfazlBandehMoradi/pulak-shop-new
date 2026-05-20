import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  login as loginApi,
  refreshToken,
  type LoginRequest,
  type LoginResponse,
  type User,
} from "@/utils/authApi";
import { clearCartSessionId } from "@/utils/cartApi";
import useCartStore from "@/stores/cartStore";
import { useQueryClient } from "@tanstack/react-query";

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

function parseStoredUser(storedUser: string | null): User | null {
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthSession = useCallback((session: LoginResponse) => {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));

    setToken(session.token);
    setUser(session.user);
  }, []);

  const clearAuthAndCartState = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    clearCartSessionId();
    useCartStore.getState().setCart(null);
    queryClient.removeQueries({ queryKey: ["cart"] });
    queryClient.removeQueries({ queryKey: ["wallet"] });
    queryClient.removeQueries({ queryKey: ["checkout"] });
    queryClient.removeQueries({ queryKey: ["payment"] });
    queryClient.removeQueries({ queryKey: ["profile"] });

    setToken(null);
    setUser(null);
  }, [queryClient]);

  const refreshAuthToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response: LoginResponse = await refreshToken(storedRefreshToken);

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);

    // Keep user persistence resilient even if backend omits user on refresh.
    if (response.user != null) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);
    }

    setToken(response.token);
  }, []);

  // Initial auth hydration + best-effort token refresh
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = parseStoredUser(localStorage.getItem(USER_KEY));

        if (!storedToken) {
          setToken(null);
          setUser(null);
          return;
        }

        setToken(storedToken);
        setUser(storedUser);

        if (import.meta.env.DEV) {
          console.log("[AuthContext] hydration", {
            path: window.location.pathname,
            hasToken: true,
            hasUser: Boolean(storedUser),
          });
        }

        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!storedRefreshToken) {
          return;
        }

        try {
          await refreshAuthToken();
        } catch (error) {
          const refreshError = error as Error & { status?: number };
          const isUnauthorizedRefresh =
            refreshError.status === 401 || refreshError.status === 403;

          if (isUnauthorizedRefresh) {
            clearAuthAndCartState();
          } else if (import.meta.env.DEV) {
            console.warn("[AuthContext] silent refresh failed", error);
          }
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        clearAuthAndCartState();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const handleTokenRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ token?: string; user?: User | null }>;
      const nextToken = customEvent.detail?.token ?? null;
      const nextUser = customEvent.detail?.user;

      setToken(nextToken);

      if (nextUser != null) {
        setUser(nextUser);
      }
    };

    const handleTokenExpired = () => {
      clearAuthAndCartState();
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
  }, [clearAuthAndCartState, refreshAuthToken]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await loginApi(credentials);
      setAuthSession(response);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthAndCartState();
  };

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
