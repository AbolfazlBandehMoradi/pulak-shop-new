import { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getBlogs, type BlogListItem } from "@/utils/blogApi";
import { Button } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import {
  Search,
  Calendar,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { useLangStore } from "@/stores/languageStore";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";


// Helper to get image URL with base URL
const getImageUrl = (filePath?: string) => {
  if (!filePath) return null;
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5299";
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  return `${apiBaseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
};

// Helper to format date
const formatDate = (dateString?: string, langCode: string = "en") => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(
    langCode === "fa" ? "fa-IR" : langCode === "ar" ? "ar-SA" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
};

export default function BlogListPage() {
  const { langCode: routeLangCode } = useParams<{ langCode: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentLanguage = useLangStore((s) => s.lang);
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const localizedPath = useLocalizedPath();

  // Determine language code - prioritize route param, then context, then default
  const effectiveLangCode =
    routeLangCode || currentLanguage || "fa";

  // State for pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(12);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [isFeatured, setIsFeatured] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("publishedat");
  const [sortDescending, setSortDescending] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
          isFeatured: isFeatured,
          sortBy,
          sortDescending,
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
  }, [
    effectiveLangCode,
    currentPage,
    pageSize,
    searchQuery,
    isFeatured,
    sortBy,
    sortDescending,
  ]);

  // Update URL when search changes
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
    <div className="min-h-screen flex flex-col bg-background">

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 lg:py-8">
        {/* Page Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t("blog.list.title") || "Blog"}
          </h1>
          <p className="text-muted-foreground">
            {t("blog.list.description") ||
              "Discover our latest articles and insights"}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    t("blog.list.searchPlaceholder") || "Search articles..."
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </form>

            {/* View Mode and Filters */}
            <div className="flex items-center gap-3">
              {/* Featured Toggle */}
              <Button
                variant={isFeatured === true ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setIsFeatured(isFeatured === true ? undefined : true)
                }
              >
                {t("blog.featured") || "Featured"}
              </Button>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortDescending ? "desc" : "asc"}`}
                onChange={(e) => {
                  const [newSortBy, direction] = e.target.value.split("-");
                  setSortBy(newSortBy);
                  setSortDescending(direction === "desc");
                }}
                className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="publishedat-desc">
                  {t("blog.list.sort.newest") || "Newest First"}
                </option>
                <option value="publishedat-asc">
                  {t("blog.list.sort.oldest") || "Oldest First"}
                </option>
                <option value="createdat-desc">
                  {t("blog.list.sort.recent") || "Recently Added"}
                </option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-card">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded transition-colors",
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Blog List */}
        {loading ? (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
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
            <p className="text-lg text-muted-foreground mb-4">
              {t("blog.list.noResults") || "No blogs found"}
            </p>
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
            <div
              className={cn(
                "grid gap-6 mb-8",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {blogs.map((blog, index) => {
                const imageUrl = blog.mainImage
                  ? getImageUrl(blog.mainImage.filePath)
                  : null;
                return (
                  <motion.article
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      "bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group",
                      viewMode === "list" && "flex flex-col md:flex-row"
                    )}
                  >
                    <Link
                      to={localizedPath(`/blogs/${blog.slug}`)}
                      className={cn(
                        "block",
                        viewMode === "list" && "md:w-64 flex-shrink-0"
                      )}
                    >
                      {imageUrl ? (
                        <div
                          className={cn(
                            "relative overflow-hidden bg-muted",
                            viewMode === "grid"
                              ? "aspect-video"
                              : "h-full min-h-[200px] md:min-h-[180px]"
                          )}
                        >
                          <img
                            src={imageUrl}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {blog.isFeatured && (
                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                                {t("blog.featured") || "Featured"}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "bg-muted flex items-center justify-center",
                            viewMode === "grid"
                              ? "aspect-video"
                              : "h-full min-h-[200px] md:min-h-[180px]"
                          )}
                        >
                          <span className="text-muted-foreground text-sm">
                            {t("blog.list.noImage") || "No Image"}
                          </span>
                        </div>
                      )}
                    </Link>
                    <div
                      className={cn(
                        "p-5 flex flex-col flex-1",
                        viewMode === "list" && "md:flex-1"
                      )}
                    >
                      <div className="flex-1">
                        <Link to={localizedPath(`/blogs/${blog.slug}`)}>
                          <h2 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {blog.title}
                          </h2>
                        </Link>
                        {blog.excerpt && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                            {blog.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                        {blog.publishedAt && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {formatDate(blog.publishedAt, effectiveLangCode)}
                            </span>
                          </div>
                        )}
                        <Link
                          to={localizedPath(`/blogs/${blog.slug}`)}
                          className="flex items-center gap-1.5 text-primary hover:underline ml-auto"
                        >
                          {t("blog.list.readMore") || "Read More"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

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
                  {t("blog.list.page") || "Page"} {currentPage}{" "}
                  {t("blog.list.of") || "of"} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                >
                  {t("blog.list.next") || "Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
