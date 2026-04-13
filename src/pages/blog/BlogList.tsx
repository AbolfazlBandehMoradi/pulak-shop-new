import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
    const isRTL = langCode === "fa";
    const localizedPath = useLocalizedPath();

    return (
        <div className="space-y-4">
            {blogs.map((blog) => {
                const [isHovered, setIsHovered] = useState(false);
                const imageUrl = blog.mainImage ? getImageUrl(blog.mainImage.filePath) : null;

                return (
                    <Link
                        key={blog.slug}
                        to={localizedPath(`/blogs/${blog.slug}`)}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={cn(
                            "flex gap-6 p-4 rounded-2xl transition-colors duration-300",
                            isHovered ? "bg-first text-white" : "bg-gray-100 text-black"
                        )}
                    >
                        {/* Image */}
                        <div className="w-40 h-40 flex-shrink-0">
                            {imageUrl ? (
                                <img src={imageUrl} className="w-full h-full object-contain" alt={blog.title} />
                            ) : (
                                <div className="bg-muted w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                                    {t("blog.list.noImage") || "No Image"}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-between flex-1">
                            <div>
                                <h3 className="font-semibold text-base mb-1">{blog.title}</h3>
                                {blog.excerpt && <p className="text-sm line-clamp-2">{blog.excerpt}</p>}

                                <div className="flex items-center gap-1 mt-2 text-xs">
                                    {blog.publishedAt && (
                                        <>
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(blog.publishedAt, langCode)}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end mt-4">
                                <div
                                    className={cn(
                                        "px-3 py-1 rounded-md bg-first hover:bg-first-700 text-white text-sm",
                                        "flex items-center justify-center"
                                    )}
                                >
                                    {t("blog.readMore")}
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
