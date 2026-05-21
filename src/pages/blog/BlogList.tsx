import { Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { cn } from "@/utils/cn";
import { getImageUrl, formatDate } from "@/utils/blogHelpers";
import { useTranslation } from "@/i18n/useTranslation";
import type { BlogListItem } from "@/utils/blogApi";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface BlogListProps {
  blogs: BlogListItem[];
  langCode: string;
}

export function BlogList({ blogs, langCode }: BlogListProps) {
  const { t } = useTranslation();
  const localizedPath = useLocalizedPath();
  const isRTL = langCode === "fa";

  return (
    <div className="space-y-4">
      {blogs.map((blog) => {
        const imageUrl = blog.mainImage ? getImageUrl(blog.mainImage.filePath) : null;

        return (
          <Link
            key={blog.id}
            to={localizedPath(`/blogs/${blog.slug}`)}
            className={cn(
              "group block overflow-hidden rounded-2xl border border-gray-500/25 bg-color-for-layer-on-body p-3 transition-all duration-300 hover:border-first/45 hover:shadow-[0_14px_28px_-16px_rgba(0,0,0,0.55)]",
              isRTL ? "text-right" : "text-left"
            )}
          >
            <article
              className={cn(
                "flex flex-col gap-4 sm:items-start",
                isRTL ? "sm:flex-row-reverse" : "sm:flex-row"
              )}
            >
              <div className="h-48 w-full shrink-0 overflow-hidden rounded-xl bg-color-for-layer-sec sm:h-40 lg:w-56">
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

              <div className="flex min-w-0 flex-1 flex-col gap-3 py-1">
                <div className="flex items-center justify-between gap-3">
                  {blog.isFeatured ? (
                    <span className="rounded-full bg-first px-2.5 py-1 text-xs text-white">
                      {t("blog.featured")}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-1 text-xs first-text-color-for-paragraph-low">
                    <Calendar className="h-3.5 w-3.5" />
                    {blog.publishedAt ? formatDate(blog.publishedAt, langCode) : "-"}
                  </span>
                </div>

                <h2 className="line-clamp-2 text-xl font-s-bold first-text-color transition-colors group-hover:text-first">
                  {blog.title}
                </h2>

                {blog.excerpt && (
                  <p className="line-clamp-3 text-sm leading-6 first-text-color-for-paragraph">
                    {blog.excerpt}
                  </p>
                )}

                <div className={cn("mt-auto flex", isRTL ? "justify-start" : "justify-end")}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg bg-first px-3 py-1.5 text-sm text-white transition-all group-hover:bg-first-600",
                      isRTL ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {t("blog.readMore")}
                    <ArrowLeft className={cn("h-3.5 w-3.5", !isRTL && "rotate-180")} />
                  </span>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
