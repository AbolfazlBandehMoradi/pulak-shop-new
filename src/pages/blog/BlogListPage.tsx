import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Grid, List, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/i18n/useTranslation";
import { useLangStore } from "@/stores/languageStore";
import { getBlogs, type BlogListItem } from "@/utils/blogApi";
import { BlogGrid } from "./BlogGrid";
import { BlogList } from "./BlogList";

type ViewMode = "grid" | "list";

export default function BlogListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = useLangStore((state) => state.lang);
  const isRTL = useLangStore((state) => state.dir) === "rtl";

  const initialSearch = searchParams.get("search") ?? "";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage));
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [refreshKey, setRefreshKey] = useState(0);

  const pageSize = 9;

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getBlogs({
          langCode: lang,
          pageNumber: currentPage,
          pageSize,
          search: searchQuery || undefined,
          status: "Published",
          sortBy: "publishedat",
          sortDescending: true,
        });

        setBlogs(response.blogs);
        setTotalCount(response.totalCount);
      } catch (fetchError) {
        console.error("Failed to load blogs:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [lang, currentPage, pageSize, searchQuery, refreshKey]);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (searchQuery) {
      nextParams.set("search", searchQuery);
    }

    if (currentPage > 1) {
      nextParams.set("page", String(currentPage));
    }

    setSearchParams(nextParams, { replace: true });
  }, [searchQuery, currentPage, setSearchParams]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <section className="mx-auto mt-24 px-4 sm:container lg:mt-8">
      <div className="rounded-3xl bg-color-for-layer-on-body p-4 lg:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className={cn("space-y-1", isRTL ? "text-right" : "text-left")}>
            <h1 className="text-2xl font-s-bold first-text-color lg:text-3xl">{t("blog.title")}</h1>
            <p className="text-sm first-text-color-for-paragraph">
              {t("blog.blog")}: {totalCount}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-gray-500/35 bg-color-for-layer-sec p-1">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-lg p-2 transition-colors",
                viewMode === "grid" ? "bg-first text-white" : "first-text-color-for-paragraph hover:bg-first/15"
              )}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-lg p-2 transition-colors",
                viewMode === "list" ? "bg-first text-white" : "first-text-color-for-paragraph hover:bg-first/15"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </header>

        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="flex min-h-12 overflow-hidden rounded-2xl border border-gray-500/35 bg-color-for-layer-sec">
            <button
              type="submit"
              className={cn(
                "inline-flex w-14 shrink-0 items-center justify-center bg-first text-white transition-colors hover:bg-first-600",
                isRTL ? "order-2" : "order-1"
              )}
              aria-label={t("blog.searchPlaceholder")}
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("blog.searchPlaceholder")}
              className={cn(
                "w-full border-none bg-transparent px-4 text-sm first-text-color placeholder:first-text-color-for-paragraph-low focus:outline-none focus:ring-0",
                isRTL ? "order-1 text-right" : "order-2 text-left"
              )}
            />
          </div>
        </form>

        {loading ? (
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-500/25 bg-color-for-layer-sec">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-sm first-text-color">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="mt-3 inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry")}
            </Button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-500/40 p-8 text-center">
            <p className="text-sm first-text-color-for-paragraph">{t("blog.noResults")}</p>
            {searchQuery && (
              <Button type="button" variant="outline" size="sm" onClick={handleClearSearch} className="mt-4">
                {t("blog.clearSearch")}
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? <BlogGrid blogs={blogs} langCode={lang} /> : <BlogList blogs={blogs} langCode={lang} />}

            {totalPages > 1 && (
              <div className={cn("flex items-center justify-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className={cn("inline-flex items-center gap-1", isRTL ? "flex-row-reverse" : "flex-row")}
                >
                  {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  {t("blog.previous")}
                </Button>

                <span className="rounded-lg bg-color-for-layer-sec px-3 py-2 text-xs first-text-color-for-paragraph">
                  {t("blog.page")} {currentPage} {t("blog.of")} {totalPages}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage >= totalPages}
                  className={cn("inline-flex items-center gap-1", isRTL ? "flex-row-reverse" : "flex-row")}
                >
                  {t("blog.next")}
                  {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
