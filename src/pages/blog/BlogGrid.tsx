import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
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
    const isRTL = langCode === "fa";
    const localizedPath = useLocalizedPath();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                            "relative p-4 rounded-2xl flex flex-col justify-between transition-colors duration-300",
                            isHovered ? "bg-[#1b9a9d] text-white" : "bg-gray-100 text-black"
                        )}
                    >
                        {blog.isFeatured && (
                            <div className="absolute top-4 start-4 z-10">
                                <Badge className={cn("text-xs py-1 px-2", isHovered ? "bg-yellow-400 text-black" : "bg-primary text-primary-foreground")}>
                                    {t("blog.featured") || "Featured"}
                                </Badge>
                            </div>
                        )}

                        <div className="h-56 flex items-center justify-center">
                            {imageUrl ? (
                                <img src={imageUrl} className="h-full w-full object-contain" alt={blog.title} />
                            ) : (
                                <div className="bg-muted flex items-center justify-center w-full h-full">
                                    {t("blog.list.noImage") || "No Image"}
                                </div>
                            )}
                        </div>

                        <hr className="my-3 border-gray-300" />

                        <div className="flex-1">
                            <h3 className="font-semibold text-base mb-1 line-clamp-1">{blog.title}</h3>
                            {blog.excerpt && <p className="text-sm line-clamp-2">{blog.excerpt}</p>}
                        </div>

                        <div className="flex justify-between items-center mt-4 text-xs">
                            {blog.publishedAt && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(blog.publishedAt, langCode)}</span>
                                </div>
                            )}
                            <div className={cn(
                                "px-3 py-1 rounded-md bg-first hover:bg-first-700 text-white text-sm",
                                "flex items-center justify-center"
                            )}>
                                {t("blog.readMore")}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
