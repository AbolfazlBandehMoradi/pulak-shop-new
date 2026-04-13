import React from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Blog } from "@/types";
import { BlogCardSkeleton } from "@/components/ui/Skeletons";
import { useLangStore } from "@/stores/languageStore";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";


interface BlogsProps {
  blogs?: Blog[];
  loading?: boolean;
}

export const Blogs: React.FC<BlogsProps> = ({
  blogs = [],
  loading = false,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "fa";
  const getBlogContent = (blog: Blog) => ({
    title: isRTL ? blog.title : blog.titleEn || blog.title,
    excerpt: isRTL ? blog.excerpt : blog.excerptEn || blog.excerpt,
    author: isRTL ? blog.author : blog.authorEn || blog.author,
    category: isRTL ? blog.category : blog.categoryEn || blog.category,
  });

  const mainBlog = blogs[0];
  const sideBlogs = blogs.slice(1, 3);
  const { lang } = useLangStore();
  const localizedPath = useLocalizedPath();
  return (
    <section
      id="blog"
      className="relative sm:container mx-auto mt-8 lg:mt-16 px-4"
    >
      <header
        className={`flex flex-wrap items-center justify-between mb-4 ${lang === "fa"
          ? " "
          : "flex flex-row-reverse"
          }`}
      >
        <div
          className={`flex w-full flex-wrap items-center justify-between  lg:w-11/24 ${lang === "fa"
            ? " "
            : "flex flex-row-reverse flex-s"
            }`} >
          <div
            className={`flex w-full  items-center gap-2 ${lang === "fa"
              ? " "
              : "flex flex-row-reverse"
              }`}>
            <h2 className="font-s-sbold gap-1 flex first-text-color text-2xl">
              <span>{t("blog.title")}</span>
            </h2>
          </div>
        </div>
        <div
          className={`flex items-center justify-between lg:justify-end mt-4 lg:mt-0 w-full  lg:w-12/24 lg:gap-3 ${lang === "fa"
            ? " "
            : "flex flex-row-reverse"
            }`}>
          <div
            className={`mt-4 flex w-full lg:mt-0  ${lang === "fa"
              ? "lg:w-6/12 lg:flex-row-reverse"
              : ""
              }`}>
            <Link
              className={`button-with-icon-on-secound-layout text-sm flex items-center h-14 px-4 rounded-2xl gap-2 ${lang === "fa"
                ? ""
                : "flex-row-reverse"
                }`}
              to={localizedPath("/blogs")}
            >
              <span className="button-with-icon-on-secound-layout__span">
                {t("blog.AllBlog")}
              </span>
              <span
                className={`button-with-icon-on-secound-layout__svg h-8 flex justify-center items-center rounded-full w-8 ${lang === "fa"
                  ? " rotate-0"
                  : " rotate-180"
                  }`}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 7L9 12L14 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex justify-between flex-wrap">
        {loading ? (
          <BlogCardSkeleton />
        ) : (
          mainBlog && (
            <article className="w-full lg:w-47/96">
              <Link
                className="relative group "
                to={localizedPath(`/blogs/${mainBlog.slug || mainBlog.id}`)}
              >
                <div className="relative aspect-16/8 overflow-hidden">
                  <img
                    src={mainBlog.image}
                    className="w-full h-full rounded-xl object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div
                  className={`absolute left-4 justify-between px-4 py-2 right-4 rounded-lg flex bottom-4 
  bg-color-for-layer-on-body 
  group-hover:bg-first transition-colors duration-300
                  ${lang === "fa"
                      ? "flex-row"
                      : "flex-row-reverse"
                    }`}
                >
                  <h3
                    className={`font-s-medium truncate max-w-11/12 
  first-text-color group-hover:text-white transition-colors duration-300
  ${lang === "fa"
                        ? "text-right"
                        : "text-left m-ltr"
                      }`}
                  >
                    {getBlogContent(mainBlog).title}
                  </h3>
                  <div
                    className={`h-6 w-6 rounded-full flex justify-center items-center 
  bg-first group-hover:bg-white transition-colors duration-300
  ${lang === "fa" ? "rotate-0" : "rotate-180"}`}
                  >
                    <ChevronLeft className="w-4 h-4 text-white group-hover:text-first transition-colors duration-300" />
                  </div>
                </div>
              </Link>
            </article>
          )
        )}
        <div className="w-full lg:w-47/96">
          <div className="flex flex-col h-full justify-between gap-3">
            {loading
              ? [...Array(2)].map((_, i) => <BlogCardSkeleton key={i} />)
              : sideBlogs.map((blog) => {
                const content = getBlogContent(blog);
                return (
                  <Link
                    key={blog.id}
                    to={localizedPath(`/blogs/${blog.slug || blog.id}`)}
                    className="group block"
                  >
                    <article
                      className="
                flex w-full gap-3 p-4 rounded-xl 
                bg-color-for-layer-on-body 
                transition-all duration-300 
                hover:bg-first hover:shadow-lg
                cursor-pointer
              "
                    >
                      {/* تصویر */}
                      <div className="relative w-36 h-36 overflow-hidden rounded-lg">
                        <img
                          src={blog.image}
                          className="
                      w-full h-full object-cover 
                      transition-transform duration-500 
                      group-hover:scale-105
                    "
                        />
                      </div>

                      {/* محتوا */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className={` font-s-medium text-lg
                          first-text-color
                          group-hover:text-white
                          transition-colors duration-300
                          truncate ${lang === "fa"
                              ? "text-right"
                              : "text-left"
                            }`}>
                          {content.title}
                        </h4>
                        <p
                          className={` first-text-color-for-paragraph 
                      group-hover:text-white/80 
                      transition-colors duration-300 
                      line-clamp-2 mt-1e ${lang === "fa"
                              ? "text-right"
                              : "text-left m-ltr"
                            }`}>
                          {content.excerpt}
                        </p>
                      </div>
                    </article>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
};
