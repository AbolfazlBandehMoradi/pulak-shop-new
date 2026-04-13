import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLangStore } from "@/stores/languageStore";

type IndexErrorProps = {
  onRetry?: () => void;
};

const ApiError = ({ onRetry }: IndexErrorProps) => {
  const lang = useLangStore((s) => s.lang);

  const isFa = lang === "fa";

  const t = {
    title: isFa ? "خطایی رخ داد" : "Something went wrong",
    description: isFa
      ? "مشکلی در بارگذاری اطلاعات صفحه پیش آمد. لطفاً اتصال اینترنت خود را بررسی کنید یا دوباره تلاش کنید."
      : "We couldn't load the page data. Please check your connection or try again.",
    retry: isFa ? "تلاش مجدد" : "Try again",
  };

  return (
    <div
      dir={isFa ? "rtl" : "ltr"}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>

      <h2 className="text-xl font-semibold">{t.title}</h2>

      <p className="max-w-md text-sm text-gray-500">{t.description}</p>

      <Button onClick={onRetry} className="flex items-center gap-2 text-gray-900">
        <RotateCcw size={16} />
        {t.retry}
      </Button>
    </div>
  );
};

export default ApiError;