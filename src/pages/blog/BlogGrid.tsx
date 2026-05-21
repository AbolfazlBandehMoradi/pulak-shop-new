import { Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { cn } from "@/utils/cn";
import { getImageUrl, formatDate } from "@/utils/blogHelpers";
import { useTranslation } from "@/i18n/useTranslation";
import type { BlogListItem } from "@/utils/blogApi";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface BlogGridProps {
  blogs: BlogListItem[];
  langCode: string;
}

export function BlogGrid({ blogs, langCode }: BlogGridProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const isRTL = langCode === "fa";

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => {
        const imageUrl = blog.mainImage ? getImageUrl(blog.mainImage.filePath) : null;

        return (
          <Link
            key={blog.id}
            to={localizedPath(`/blogs/${blog.slug}`)}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-500/25 bg-color-for-layer-on-body transition-all duration-300 hover:-translate-y-1 hover:border-first/45 hover:shadow-[0_14px_28px_-16px_rgba(0,0,0,0.55)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-color-for-layer-sec">
              {blog.isFeatured && (
                <span className="absolute start-3 top-3 z-10 rounded-full bg-first px-2.5 py-1 text-xs text-white">
                  {t("blog.featured")}
                </span>
              )}

              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={blog.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center first-text-color-for-paragraph-low">
                  {t("blog.noImage")}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
              <h2 className="line-clamp-2 text-lg font-s-bold first-text-color transition-colors group-hover:text-first">
                {blog.title}
              </h2>

              {blog.excerpt && (
                <p className="line-clamp-3 text-sm first-text-color-for-paragraph">
                  {blog.excerpt}
                </p>
              )}

              <div
                className={cn(
                  "mt-auto flex items-center justify-between gap-2 text-xs",
                  isRTL ? "flex-row" : "flex-row-reverse"
                )}
              >
                <span className="inline-flex items-center gap-1 first-text-color-for-paragraph-low">
                  <Calendar className="h-3.5 w-3.5" />
                  {blog.publishedAt ? formatDate(blog.publishedAt, langCode) : "-"}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg bg-first px-3 py-1.5 text-white transition-all group-hover:bg-first-600",
                    isRTL ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {t("blog.readMore")}
                  <ArrowLeft className={cn("h-3.5 w-3.5", !isRTL && "rotate-180")} />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
