import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getBlogBySlug,
  type BlogDetail,
  type BlogListItem,
} from "@/utils/blogApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  Calendar,
  Clock,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  User,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { CommentResourceType } from "@/utils/commentApi";
import { cn } from "@/utils/cn";
import { useLangStore } from "@/stores/languageStore";
import { Button } from "@/components/ui/Button";
import { RelatedProducts } from "../shop/Product-Detail/sections/RelatedProducts";
import { CommentSection } from "../shop/Product-Detail/sections/CommentSection";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
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

const getMockAuthor = (langCode: string): Author => {
  if (langCode === "fa") {
    return {
      name: "گاما طب",
      unknown: "ناشناس",
      bio: "نویسندگان متخصص ما آخرین بینش‌ها، نکات و روندها در زمینه فناوری، سبک زندگی و موارد دیگر را برای شما به ارمغان می‌آورند.",
      role: "نویسنده",
      avatar: undefined,
    };
  }
  return {
    name: "Editorial Team",
    unknown: "unknown",
    bio: "Our expert writers bring you the latest insights, tips, and trends in technology, lifestyle, and more.",
    role: "Writer",
    avatar: undefined,
  };
};
// Helper to format date
const formatDate = (dateString?: string, langCode: string = "en") => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(
    langCode === "fa" ? "fa-IR" : langCode === "ar" ? "ar-SA" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
};

// Calculate reading time from HTML content
const calculateReadingTime = (htmlContent?: string): number => {
  if (!htmlContent) return 0;

  // Remove HTML tags and get text content
  const textContent = htmlContent
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = textContent
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Average reading speed: 200-250 words per minute, use 225
  const readingTime = Math.ceil(wordCount / 225);
  return readingTime || 1;
};

// Extract table of contents from HTML content
const extractTableOfContents = (
  htmlContent?: string
): Array<{ id: string; text: string; level: number }> => {
  if (!htmlContent) return [];

  const toc: Array<{ id: string; text: string; level: number }> = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const headings = doc.querySelectorAll("h2, h3, h4");
  headings.forEach((heading, index) => {
    const text = heading.textContent?.trim() || "";
    const level = parseInt(heading.tagName.charAt(1));
    const id = `heading-${index}-${text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}`;

    // Add ID to heading for anchor links
    heading.id = id;

    toc.push({ id, text, level });
  });

  return toc;
};

// Mock author data (can be replaced with real API data later)
interface Author {
  name: string;
  unknown: string;
  bio: string;
  avatar?: string;
  role?: string;
}

// Social share component
function SocialShareBar({
  title,
  url,
  excerpt,
  orientation = "vertical",
}: {
  title: string;
  url: string;
  excerpt?: string;
  orientation?: "vertical" | "horizontal";
}) {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: "hover:bg-blue-500 hover:text-white",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      color: "hover:bg-sky-500 hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: "hover:bg-blue-600 hover:text-white",
    },
    {
      name: "Copy Link",
      icon: LinkIcon,
      url: "#",
      color: "hover:bg-gray-500 hover:text-white",
      onClick: async () => {
        await navigator.clipboard.writeText(url);
      },
    },
  ];

  const handleShare = async (link: (typeof shareLinks)[0]) => {
    if (link.onClick) {
      link.onClick();
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt,
          url,
        });
      } catch (err) {
        if (link.url !== "#") {
          window.open(link.url, "_blank", "width=600,height=400");
        }
      }
    } else if (link.url !== "#") {
      window.open(link.url, "_blank", "width=600,height=400");
    }
  };

  if (orientation === "horizontal") {
    return (
      <div className="flex items-center justify-between ">
        {shareLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.name}
              onClick={() => handleShare(link)}
              className={cn(
                "p-2 rounded-full border-gray-500 border text-gray-500 transition-colors",
                link.color
              )}
              aria-label={`Share on ${link.name}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    );
  }

}

export default function BlogPage() {
  const { t } = useTranslation();
  const { slug, langCode: routeLangCode } = useParams<{
    slug: string;
    langCode: string;
  }>();
  const navigate = useLocalizedNavigate();
  const localizedPath = useLocalizedPath();
  const currentLanguage = useLangStore((s) => s.lang);
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogListItem[]>([]);
  const author = getMockAuthor(currentLanguage);

  // Determine language code - prioritize route param, then context, then default
  const effectiveLangCode = routeLangCode || currentLanguage || "fa";

  // Load blog data
  useEffect(() => {
    if (!slug) return;

    const loadBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const blogData = await getBlogBySlug(slug, effectiveLangCode);
        setBlog(blogData);
      } catch (err) {
        console.error("Failed to load blog:", err);
        setError(err instanceof Error ? err.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug, effectiveLangCode]);

  const translation = blog?.translation;
  const mainImageUrl = blog?.mainImage
    ? getImageUrl(blog.mainImage.filePath)
    : null;
  const readingTime = useMemo(
    () => calculateReadingTime(translation?.content),
    [translation?.content]
  );
  const tableOfContents = useMemo(
    () => extractTableOfContents(translation?.content),
    [translation?.content]
  );
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const relatedProductsForComponent =
    blog?.relatedProducts?.map((rp, index) => ({
      id: index + 1,
      productId: rp.productId,
      relatedProductId: rp.productId,
      relationType: "related",
      displayOrder: rp.displayOrder,
      isBidirectional: false,
      relatedProduct: {
        id: rp.productId,
        slug: rp.productSlug,
        sku: "",
        name: rp.productName,
        isPublished: true,
        isFeatured: false,
        status: "Published",
        mainImage: rp.productImageUrl
          ? {
            id: 0,
            fileName: "",
            filePath: rp.productImageUrl,
            thumbnailPath: rp.productImageUrl,
            alt: rp.productName,
            title: rp.productName,
          }
          : undefined,
        createdAt: "",
        updatedAt: "",
        price: rp.price,
        salePrice: undefined,
        currencyCode: rp.currencyCode,
        currencySymbol: "",
        discountPercent: undefined,
        isOnSale: false,
        stockQuantity: undefined,
      },
    })) || [];

  return (
    <section className="sm:container mt-8 mx-auto px-4">
      <div className="flex flex-wrap">
        {
          loading && !blog ? (
            // Loading skeleton
            <div className="max-w-4xl mx-auto space-y-8">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          ) : error || !blog ? (
            // Error or not found
            <div className="min-h-[60vh] flex items-center justify-center">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4">
                  {t("blog.notFound") || "Blog Not Found"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("blog.notFoundMessage") ||
                    "The blog post you are looking for does not exist."}
                </p>
                <Button onClick={() => navigate(`/blogs`)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("blog.backToBlogs") || "Back to Blogs"}
                </Button>
              </motion.div>
            </div>
          ) : (
            <div
              className={`flex flex-wrap justify-between bg-color-for-layer-on-body p-4 rounded-xl ${currentLanguage === "fa"
                ? "flex-row"
                : "flex-row-reverse"
                }`}>

              <article className="w-full lg:w-65/96   xl:w-75/96">
                {mainImageUrl && (
                  <motion.div
                    className="mb-4 rounded-lg overflow-hidden "
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="w-full h-96">
                      <img
                        src={mainImageUrl}
                        alt={translation?.title || "Blog image"}
                        className="w-full h-full object-cover "
                      />
                    </div>
                  </motion.div>
                )}
                <div>
                  <h1
                    className={`first-text-color font-s-bold text-2xl ${currentLanguage === "fa"
                      ? "text-right"
                      : "text-left"
                      }`}>
                    {translation?.title || t("blog.noContent")}
                  </h1>
                  <div
                    className={`bg-third-100 p-4 my-4 rounded-lg ${currentLanguage === "fa"
                      ? "text-right"
                      : "text-left"
                      }`}>
                    {translation?.excerpt && (
                      <p className="first-text-color-const">
                        {translation.excerpt}
                      </p>
                    )}
                  </div>
                  <div >
                    {translation?.content ? (
                      <div
                        className={`first-text-color-for-paragraph ${currentLanguage === "fa"
                          ? "text-right"
                          : "text-left"
                          }`}
                        dangerouslySetInnerHTML={{ __html: translation.content }}
                      />
                    ) : (
                      <p className="first-text-color-for-paragraph">
                        {t("blog.noContent")}
                      </p>
                    )}
                  </div>
                </div>
                {blog.relatedProducts && blog.relatedProducts.length > 0 && (
                  <motion.section
                    className="mt-8 pt-6 border-t border-border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 text-foreground">
                      {t("blog.relatedProducts") || "Related Products"}
                    </h2>
                    <RelatedProducts
                      relatedProducts={relatedProductsForComponent}
                      languageCode={effectiveLangCode}
                      loading={false}
                    />
                  </motion.section>
                )}
                <hr className="my-4 first-text-color-hr-on-secound-layer" />
                <section className="relative" >
                  <CommentSection
                    resourceType={CommentResourceType.Blog}
                    resourceId={blog.id}
                    languageCode={effectiveLangCode}
                  />
                </section>
              </article>
              <aside className="w-full   lg:w-30/96 xl:w-20/96 mt-4 lg:mt-0">
                <div className="sticky border border-gray-500 top-24 bg-color-for-layer-sec p-4 rounded-lg">
                  <div className="flex w-full flex-wrap">
                    <ul className="flex flex-col gap-2 flex-wrap w-full">
                      <li className="w-full justify-between flex">
                        <span className="text-sm first-text-color-for-paragraph flex">
                          {author?.role ? (
                            author.role
                          ) : (
                            author.unknown
                          )}:
                        </span>
                        <span className="text-sm first-text-color-for-paragraph flex">
                          {author.name}
                        </span>
                      </li>
                      <li className="w-full justify-between flex">
                        <span className="text-sm first-text-color-for-paragraph flex">
                          {t("blog.readTime")}:
                        </span>
                        <span className="text-sm first-text-color-for-paragraph flex">
                          {readingTime ? readingTime : t("blog.unknown")}
                        </span>
                      </li>
                      <li className="w-full justify-between flex">
                        <span className="text-sm first-text-color-for-paragraph flex">
                          {t("blog.publishedAt")}:
                        </span>
                        <span className="text-sm first-text-color-for-paragraph flex">
                          {formatDate(blog.publishedAt, effectiveLangCode)}
                        </span>
                      </li>
                    </ul>
                    <hr />
                    <div className="w-full">
                      <h3 className="text-center text-base font-s-medium mb-2 w-full">
                        {t("blog.shortLink")}
                      </h3>
                      <SocialShareBar
                        title={translation?.title || ""}
                        url={currentUrl}
                        excerpt={translation?.excerpt}
                        orientation="horizontal"
                      />
                    </div>
                    <div className="w-full mt-2" >
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/blogs`)}
                        className="bg-first hover:bg-first-600 text-sm w-full text-white"
                        size="sm"
                      >
                        {t("blog.backToBlogs") || "Back to Blogs"}
                      </Button>
                    </div>
                  </div>
                </div>
              </aside>

            </div>
          )
        }
        {relatedArticles.length > 0 && (
          <motion.div
            className="bg-card border border-border rounded-lg p-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                {t("blog.relatedArticles") || "Related Articles"}
              </h3>
            </div>
            <div className="space-y-4">
              {relatedArticles.map((article) => {
                const articleImageUrl = article.mainImage
                  ? getImageUrl(article.mainImage.filePath)
                  : null;
                return (
                  <Link
                    key={article.id}
                    to={localizedPath(`/blogs/${article.slug}`)}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      {articleImageUrl && (
                        <img
                          src={articleImageUrl}
                          alt={article.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                          {article.title}
                        </h4>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div >
    </section >
  );
}
