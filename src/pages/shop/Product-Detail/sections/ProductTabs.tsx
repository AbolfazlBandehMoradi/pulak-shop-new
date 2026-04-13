import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";
import type { ProductDetail } from "@/utils/shopApi";

interface ProductTabsProps {
  product: ProductDetail | null;
}

type TabType = "description" | "specifications";

export function ProductTabs({ product }: ProductTabsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("description");
  const translation = product?.translation || product?.translations?.[0];

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "description", label: t("product.description") || "Description" },
    {
      id: "specifications",
      label: t("product.specifications") || "Specifications",
    },
  ];

  return (
    <div className="mb-8">
      <div className="border-b dark:border-gray-700">
        <div className="flex gap-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 border-b-2 transition-colors whitespace-nowrap text-sm",
                activeTab === tab.id
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground dark:hover:text-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {activeTab === "description" && (
            <div>
              {translation?.description ? (
                <div
                  className="prose max-w-none prose-headings:font-semibold prose-p:text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: translation.description }}
                />
              ) : (
                <p className="text-muted-foreground">
                  {t("product.noDescription") || "No description available."}
                </p>
              )}
            </div>
          )}

          {activeTab === "specifications" && (
            <div>
              {product?.specificationsJson ? (
                (() => {
                  try {
                    const parsedSpecifications = JSON.parse(
                      product.specificationsJson
                    ) as unknown;
                    const specifications =
                      parsedSpecifications &&
                      typeof parsedSpecifications === "object"
                        ? (parsedSpecifications as Record<
                            string,
                            string | number | boolean | null
                          >)
                        : {};
                    const entries = Object.entries(specifications);

                    if (entries.length > 0) {
                      return (
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {entries.map(([key, value], index) => (
                            <motion.div
                              key={key}
                              className="border-b dark:border-gray-700 pb-2"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <dt className="font-medium text-sm text-muted-foreground dark:text-gray-400">
                                {key}
                              </dt>
                              <dd className="mt-1 dark:text-gray-300">
                                {String(value ?? "-")}
                              </dd>
                            </motion.div>
                          ))}
                        </dl>
                      );
                    }
                  } catch (error) {
                    console.error(
                      "Failed to parse product specifications:",
                      error
                    );
                  }

                  return (
                    <p className="text-muted-foreground">
                      {t("product.noSpecifications") ||
                        "No specifications available."}
                    </p>
                  );
                })()
              ) : (
                <p className="text-muted-foreground">
                  {t("product.noSpecifications") ||
                    "No specifications available."}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
