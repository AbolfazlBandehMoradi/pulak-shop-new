import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isSupportedLang } from "@/utils/langRouting";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const pathLang = location.pathname.split("/").filter(Boolean)[0];
  const authPath = isSupportedLang(pathLang) ? `/${pathLang}/auth` : "/auth";

  if (import.meta.env.DEV) {
    console.log("[ProtectedRoute]", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
    });
  }

  if (isLoading) {
    return null;
  }

  if (!isLoading && !isAuthenticated) {
    return (
      <Navigate
        to={authPath}
        replace
        state={{ redirectUrl: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
