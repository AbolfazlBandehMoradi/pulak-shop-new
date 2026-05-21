import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Copy,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/utils/cn";
import { formatDate, getImageUrl } from "@/utils/blogHelpers";
import { useLangStore } from "@/stores/languageStore";
import { getBlogBySlug, type BlogDetail } from "@/utils/blogApi";
import { useLocalizedNavigate } from "@/hooks/useLocalizedNavigate";
import { RelatedProducts } from "../shop/Product-Detail/sections/RelatedProducts";
import { CommentSection } from "../shop/Product-Detail/sections/CommentSection";
import { CommentResourceType } from "@/utils/commentApi";
import type { RelatedProduct as ProductRelatedProduct } from "@/utils/shopApi";

type TableOfContentsItem = {
  id: string;
  text: string;
  level: number;
};

const WORDS_PER_MINUTE = 225;

function calculateReadingTime(content?: string): number {
  if (!content) return 1;

  const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

function sanitizeHeadingId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildArticleContent(content?: string): { html: string; toc: TableOfContentsItem[] } {
  if (!content) {
    return { html: "", toc: [] };
  }

  if (typeof DOMParser === "undefined") {
    return { html: content, toc: [] };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const toc: TableOfContentsItem[] = [];
  const headings = Array.from(doc.querySelectorAll("h2, h3"));

  headings.forEach((heading, index) => {
    const text = heading.textContent?.trim() ?? "";
    if (!text) return;

    const level = Number(heading.tagName.slice(1));
    const id = `section-${index + 1}-${sanitizeHeadingId(text) || "heading"}`;
    heading.id = id;
    toc.push({ id, text, level });
  });

  return {
    html: doc.body.innerHTML,
    toc,
  };
}

function mapRelatedProducts(blog: BlogDetail | null): ProductRelatedProduct[] {
  if (!blog?.relatedProducts?.length) {
    return [];
  }

  return blog.relatedProducts.map((item, index) => ({
    id: Number(`${blog.id}${index + 1}`),
    productId: item.productId,
    relatedProductId: item.productId,
    relationType: "related",
    displayOrder: item.displayOrder,
    isBidirectional: false,
    relatedProduct: {
      id: item.productId,
      slug: item.productSlug,
      sku: "",
      name: item.productName,
      isPublished: true,
      isFeatured: false,
      status: "Published",
      mainImage: item.productImageUrl
        ? {
            id: 0,
            fileName: "",
            filePath: item.productImageUrl,
            thumbnailPath: item.productImageUrl,
            alt: item.productName,
            title: item.productName,
          }
        : undefined,
      createdAt: "",
      updatedAt: "",
      price: item.price,
      salePrice: null,
      currencyCode: item.currencyCode,
      currencySymbol: undefined,
      discountPercent: null,
      isOnSale: false,
      stockQuantity: null,
    },
  }));
}

export default function BlogPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useLocalizedNavigate();
  const lang = useLangStore((state) => state.lang);
  const isRTL = useLangStore((state) => state.dir) === "rtl";

  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Missing slug");
      return;
    }

    const loadBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getBlogBySlug(slug, lang);
        setBlog(response);
      } catch (fetchError) {
        console.error("Failed to load blog:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [slug, lang]);

  const translation = blog?.translation;
  const mainImage = blog?.mainImage ? getImageUrl(blog.mainImage.filePath) : null;
  const readingTime = useMemo(() => calculateReadingTime(translation?.content), [translation?.content]);
  const { html: contentHtml, toc } = useMemo(
    () => buildArticleContent(translation?.content),
    [translation?.content]
  );
  const relatedProducts = useMemo(() => mapRelatedProducts(blog), [blog]);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(translation?.title ?? "");

  const shareLinks = [
    {
      key: "facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      key: "twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: Twitter,
    },
    {
      key: "linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: Linkedin,
    },
  ];

  const handleCopyLink = async () => {
    if (!currentUrl || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(currentUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2200);
  };

  const openShareLink = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer,width=640,height=640");
  };

  return (
    <section className="mx-auto mt-24 px-4 sm:container lg:mt-8">
      <div className="rounded-3xl bg-color-for-layer-on-body p-4 lg:p-8">
        <div className={cn("mb-4 flex", isRTL ? "justify-end" : "justify-start")}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/blogs")}
            className={cn("inline-flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}
          >
            <ArrowLeft className={cn("h-4 w-4", !isRTL && "rotate-180")} />
            {t("blog.backToBlogs")}
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : error || !blog ? (
          <div className="rounded-2xl border border-dashed border-gray-500/45 p-8 text-center">
            <h1 className="text-xl font-s-bold first-text-color lg:text-2xl">{t("blog.notFoundTitle")}</h1>
            <p className="mt-2 text-sm first-text-color-for-paragraph">{t("blog.notFoundMessage")}</p>
            <Button type="button" onClick={() => navigate("/blogs")} className="mt-4">
              {t("blog.backToBlogs")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            <article className="lg:col-span-8">
              <header className={cn("mb-5", isRTL ? "text-right" : "text-left")}>
                {blog.isFeatured && (
                  <span className="mb-3 inline-flex rounded-full bg-first px-3 py-1 text-xs text-white">
                    {t("blog.featured")}
                  </span>
                )}
                <h1 className="text-2xl font-s-bold first-text-color lg:text-4xl">
                  {translation?.title || t("blog.noContent")}
                </h1>
                {translation?.excerpt && (
                  <p className="mt-3 text-sm leading-7 first-text-color-for-paragraph lg:text-base">
                    {translation.excerpt}
                  </p>
                )}

                <div
                  className={cn(
                    "mt-4 flex flex-wrap gap-3 text-xs first-text-color-for-paragraph-low",
                    isRTL ? "justify-end" : "justify-start"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("blog.publishedAt")}: {formatDate(blog.publishedAt, lang) || t("blog.unknown")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {t("blog.readTime")}: {readingTime} {t("blog.minute")}
                  </span>
                </div>
              </header>

              {mainImage && (
                <div className="mb-5 overflow-hidden rounded-2xl">
                  <img
                    src={mainImage}
                    alt={translation?.title || "blog-image"}
                    className="h-full max-h-[460px] w-full object-cover"
                  />
                </div>
              )}

              {contentHtml ? (
                <div
                  className={cn(
                    "space-y-3 leading-8 first-text-color-for-paragraph [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-s-bold [&_h2]:first-text-color [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-s-medium [&_h3]:first-text-color [&_img]:my-5 [&_img]:rounded-xl [&_a]:text-first [&_a]:underline",
                    isRTL ? "text-right" : "text-left"
                  )}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <p className="first-text-color-for-paragraph">{t("blog.noContent")}</p>
              )}

              {relatedProducts.length > 0 && (
                <section className="mt-8 border-t border-gray-500/25 pt-6">
                  <h2 className="mb-4 text-xl font-s-bold first-text-color">{t("blog.relatedProducts")}</h2>
                  <RelatedProducts relatedProducts={relatedProducts} languageCode={lang} loading={false} />
                </section>
              )}

              <section className="mt-8 border-t border-gray-500/25 pt-6">
                <CommentSection
                  resourceType={CommentResourceType.Blog}
                  resourceId={blog.id}
                  languageCode={lang}
                />
              </section>
            </article>

            <aside className="lg:col-span-4">
              <div className="space-y-4 lg:sticky lg:top-24">
                <div className="rounded-2xl border border-gray-500/25 bg-color-for-layer-sec p-4">
                  <h3 className={cn("text-sm font-s-bold first-text-color", isRTL ? "text-right" : "text-left")}>
                    {t("blog.shortLink")}
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={cn(
                      "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-first px-3 py-2 text-sm text-white transition-colors hover:bg-first-600",
                      isRTL ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Copy className="h-4 w-4" />
                    {t("blog.copyLink")}
                  </button>
                  {copySuccess && <p className="mt-2 text-xs text-first">{t("blog.copySuccess")}</p>}
                </div>

                <div className="rounded-2xl border border-gray-500/25 bg-color-for-layer-sec p-4">
                  <h3 className={cn("text-sm font-s-bold first-text-color", isRTL ? "text-right" : "text-left")}>
                    {t("blog.share")}
                  </h3>
                  <div className={cn("mt-3 flex gap-2", isRTL ? "justify-end" : "justify-start")}>
                    {shareLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => openShareLink(item.href)}
                          className="rounded-lg border border-gray-500/35 p-2 first-text-color-for-paragraph transition-colors hover:bg-first hover:text-white"
                          aria-label={item.key}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {toc.length > 0 && (
                  <div className="rounded-2xl border border-gray-500/25 bg-color-for-layer-sec p-4">
                    <h3 className={cn("text-sm font-s-bold first-text-color", isRTL ? "text-right" : "text-left")}>
                      {t("blog.onThisPage")}
                    </h3>
                    <nav className="mt-3 space-y-2">
                      {toc.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={cn(
                            "block text-sm first-text-color-for-paragraph transition-colors hover:text-first",
                            item.level === 3 && (isRTL ? "pr-4" : "pl-4"),
                            isRTL ? "text-right" : "text-left"
                          )}
                        >
                          {item.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
