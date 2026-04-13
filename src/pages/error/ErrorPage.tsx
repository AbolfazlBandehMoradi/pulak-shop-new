import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLangStore } from "@/stores/languageStore";
import { Link } from "react-router-dom";

const RouterErrorPage = () => {
  const lang = useLangStore((s) => s.lang);
  const isFa = lang === "fa";

  const error = useRouteError();

  // Default messages
  let title = isFa ? "خطایی رخ داد" : "Something went wrong";
  let description = isFa
    ? "مشکلی در بارگذاری صفحه پیش آمد. لطفاً دوباره تلاش کنید."
    : "There was a problem loading the page. Please try again.";

  // 404 not found
  if (isRouteErrorResponse(error) && error.status === 404) {
    title = isFa ? "صفحه پیدا نشد" : "Page not found";
    description = isFa
      ? "متأسفانه صفحه‌ای که به دنبال آن بودید پیدا نشد. لطفاً به صفحه اصلی بازگردید."
      : "Sorry, the page you are looking for could not be found. Please return to the home page.";
  }

  // Offline detection
  if (!navigator.onLine) {
    title = isFa ? "آفلاین هستید" : "You are offline";
    description = isFa
      ? "لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید."
      : "Please check your internet connection and try again.";
  }

  return (
    <div
      dir={isFa ? "rtl" : "ltr"}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>

      <h2 className="text-xl font-semibold">{title}</h2>

      <p className="max-w-md text-sm text-gray-500">{description}</p>

      <div className="flex gap-2 ">
        <Link to="/">
          <Button className="flex items-center gap-2 text-gray-800">
            <RotateCcw size={16} />
            {isFa ? "بازگشت به صفحه اصلی" : "Go to Home"}
          </Button>
        </Link>

        {!navigator.onLine ? null : (
          <Button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-gray-800"
          >
            <RotateCcw size={16} />
            {isFa ? "تلاش مجدد" : "Try again"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default RouterErrorPage;