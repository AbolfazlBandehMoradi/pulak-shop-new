import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import { Grid, List, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useLangStore } from "@/stores/languageStore";
import { getBlogs, type BlogListItem } from "@/utils/blogApi";
import { BlogGrid } from "./BlogGrid";
import { BlogList } from "./BlogList";

export default function BlogListPage() {
  const { langCode: routeLangCode } = useParams<{ langCode: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentLanguage = useLangStore((s) => s.lang);
  const { t } = useTranslation();

  const effectiveLangCode = routeLangCode || currentLanguage || "fa";

  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const isRTL = useLangStore((s) => s.dir) === "rtl";

  // Load blogs
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const response = await getBlogs({
          langCode: effectiveLangCode,
          pageNumber: currentPage,
          pageSize,
          search: searchQuery || undefined,
          status: "Published",
          sortBy: "publishedat",
          sortDescending: true,
        });
        setBlogs(response.blogs);
        setTotalCount(response.totalCount);
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [effectiveLangCode, currentPage, pageSize, searchQuery]);

  // Update URL search params
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  }, [searchQuery, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section className="sm:container mx-auto px-4 lg:px-0 py-24 lg:py-12 relative z-10">
      <div className=" p-4 rounded-2xl">
        <div className="flex justify-between items-center flex-wrap mb-4">
          <h1 className="text-xl first-text-color font-s-medium">{t("blog.title")}</h1>
          <div className="order-3 w-full mt-4">
            <form onSubmit={handleSearch}>
              <div className={`flex w-full ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                <button
                  type="submit"
                  aria-label={t("nav.search")}
                  className={`h-12 ${isRTL ? "rounded-l-xl" : "rounded-r-xl"} px-4 bg-first hover:bg-first-700 text-white flex items-center justify-center`}
                >
                  <Search className="w-5 h-5" aria-hidden="true" />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("blog.searchPlaceholder")}
                  className={`h-12 px-4 w-full focus:ring-0 ${isRTL ? "rounded-r-xl text-left" : "rounded-l-xl"} border border-gray-500 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400`}
                />
              </div>
            </form>
          </div>

          {/* View Mode */}
          <div className="flex border border-gray-400 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-2", viewMode === "grid" && "bg-first text-white")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-2", viewMode === "list" && "bg-first text-white")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Blog List */}
        {loading ? (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">{t("blog.list.noResults") || "No blogs found"}</p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              >
                {t("blog.list.clearSearch") || "Clear Search"}
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <BlogGrid blogs={blogs} langCode={effectiveLangCode} />
            ) : (
              <BlogList blogs={blogs} langCode={effectiveLangCode} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("blog.list.previous") || "Previous"}
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  {t("blog.list.page") || "Page"} {currentPage} {t("blog.list.of") || "of"} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  {t("blog.list.next") || "Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
