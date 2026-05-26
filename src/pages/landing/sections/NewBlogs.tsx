import { Blog } from '@/types';
import cleanText from '@/utils/cleanText';
import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Props {
  blogs: Blog[];
}

const NewBlogs = ({ blogs }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="sm:container mt-8 lg:mt-16 mx-auto px-4 relative">
      <div className="flex items-center justify-between ">
        <div className="flex items-center flex-wrap justify-between w-full ">
          <div className="flex items-center gap-3 w-full lg:w-6/12">
            <div className="first-text-color-svg  inline-block rounded-lg bg-color-for-layer-on-body p-2 ">
              <svg
                className=" h-10 w-10 lg:h-12 lg:w-12"
                width="22"
                height="16"
                viewBox="0 0 22 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12.3846C19.5 12.0769 20 9.46154 20 7C20 4.53846 19.5 1.92308 19 1.61538C18.5 1.30769 15 1 11 1C7 1 3.5 1.30769 3 1.61538C2.5 1.92308 2 4.53846 2 7C2 9.46154 2.5 12.0769 3 12.3846M2.75 12.5H19.25C19.9404 12.5 20.5 13.0596 20.5 13.75C20.5 14.4404 19.9404 15 19.25 15H2.75C2.05964 15 1.5 14.4404 1.5 13.75C1.5 13.0596 2.05964 12.5 2.75 12.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="">
              <h2 className="text-xl sm:text-2xl font-s-sbold first-text-color">
                {t('mainpage.blogs.titlePrefix')}
                <span className="text-first inline-block mx-2 font-s-bold">
                  {' '}
                  {t('mainpage.blogs.titleAccent')}
                </span>
                {t('mainpage.blogs.titleSuffix')}
              </h2>
              <p className="text-sm sm:text-base first-text-color-for-paragraph mt-2">
                {t('mainpage.blogs.description')}
              </p>
            </div>
          </div>
          <div className="w-full lg:w-4/12 flex items-center justify-start mt-4 lg:mt-0 lg:justify-end">
            <Link
              to="/blogs"
              className="button-with-icon-on-secound-layout   text-sm flex items-center h-14 px-4 rounded-2xl gap-2"
            >
              <span className="button-with-icon-on-secound-layout__span">
                {t('mainpage.blogs.more')}
              </span>
              <span className="button-with-icon-on-secound-layout__svg h-8 flex justify-center items-center rounded-full w-8">
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
      </div>
      {/* blog cards */}
      <div className="flex flex-wrap justify-between mt-5">
        <div className="lg:w-30/48 xl:w-21/48 w-full bg-color-for-layer-on-body p-4 pb-0 rounded-2xl ">
          {/* big card */}
          {blogs?.length && (
            <Link to={`/blogs/${blogs[blogs.length - 1]?.slug}`} className="">
              <div className=" w-full  rounded-xl overflow-hidden">
                <img
                  className="w-full h-52 sm:h-auto object-cover"
                  src={blogs[blogs.length - 1].image}
                  alt={blogs[blogs.length - 1].title || t('mainpage.blogs.imageAlt')}
                />
              </div>
              <div>
                <h3 className="font-s-bold text-lg mt-2 first-text-color ">
                  {blogs[blogs.length - 1]?.title}
                </h3>
                <h3 className="mt-1 text-sm font-f-light  first-text-color-for-paragraph line-clamp-4">
                  {cleanText(blogs[blogs.length - 1]?.content)}
                </h3>
                <hr className="first-text-color-hr mt-2 mb-2 " />
                <div className="flex justify-between">
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full flex justify-center items-center bg-first">
                        <span className="text-color-svg-white">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 2C11.0111 2 10.0444 2.29324 9.22215 2.84265C8.3999 3.39206 7.75904 4.17295 7.3806 5.08658C7.00216 6.00021 6.90315 7.00555 7.09607 7.97545C7.289 8.94536 7.7652 9.83627 8.46447 10.5355C9.16373 11.2348 10.0546 11.711 11.0245 11.9039C11.9945 12.0969 12.9998 11.9978 13.9134 11.6194C14.827 11.241 15.6079 10.6001 16.1573 9.77785C16.7068 8.95561 17 7.98891 17 7C17 5.67392 16.4732 4.40215 15.5355 3.46447C14.5979 2.52678 13.3261 2 12 2ZM12 10C11.4067 10 10.8266 9.82405 10.3333 9.49441C9.83994 9.16476 9.45542 8.69623 9.22836 8.14805C9.0013 7.59987 8.94189 6.99667 9.05764 6.41473C9.1734 5.83279 9.45912 5.29824 9.87868 4.87868C10.2982 4.45912 10.8328 4.1734 11.4147 4.05764C11.9967 3.94189 12.5999 4.0013 13.1481 4.22836C13.6962 4.45542 14.1648 4.83994 14.4944 5.33329C14.8241 5.82664 15 6.40666 15 7C15 7.79565 14.6839 8.55871 14.1213 9.12132C13.5587 9.68393 12.7956 10 12 10ZM21 21V20C21 18.1435 20.2625 16.363 18.9497 15.0503C17.637 13.7375 15.8565 13 14 13H10C8.14348 13 6.36301 13.7375 5.05025 15.0503C3.7375 16.363 3 18.1435 3 20V21H5V20C5 18.6739 5.52678 17.4021 6.46447 16.4645C7.40215 15.5268 8.67392 15 10 15H14C15.3261 15 16.5979 15.5268 17.5355 16.4645C18.4732 17.4021 19 18.6739 19 20V21H21Z"
                              fill="white"
                            />
                          </svg>
                        </span>
                      </div>
                      <span className="text-sm first-text-color-for-paragraph">
                        {cleanText(blogs[blogs.length - 1]?.author)}
                      </span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex items-center ">
                      <span className="text-sm first-text-color-for-paragraph">
                        {blogs[blogs.length - 1]?.readTime}
                      </span>
                      <div className="h-8 w-8 rounded-full flex justify-center items-center ">
                        <span className="first-text-color-svg">
                          <Clock />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
          {/* big card */}
        </div>
        <div className="lg:w-17/48 xl:w-26/48 w-full flex flex-col justify-between mt-3 lg:mt-0">
          {blogs?.length! > 0 &&
            blogs?.map((blog) => (
              <Link
                key={blog.id}
                to={`/blogs/${blog?.slug}`}
                className="w-full bg-color-for-layer-on-body rounded-2xl lg:first:mt-0 mt-3 p-4 flex flex-col sm:flex-row justify-between gap-3"
              >
                <div className="w-full sm:w-15/48">
                  <img
                    className="w-full rounded-xl h-40 sm:h-full object-cover object-right"
                    src={blog?.image}
                    alt={blog?.title || t('mainpage.blogs.imageAlt')}
                  />
                </div>
                <div className="w-full sm:w-32/48">
                  <h3 className="truncate font-s-regular first-text-color text-base ">
                    {blog?.title}
                  </h3>
                  <div>
                    <h3 className="mt-1 text-sm font-f-light  first-text-color-for-paragraph line-clamp-1">
                      {cleanText(blog?.content)}
                    </h3>
                    <hr className="opacity-5 mt-2 mb-2 " />
                    <div className="flex justify-between">
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full flex justify-center items-center bg-first">
                            <span className="text-color-svg-white">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 2C11.0111 2 10.0444 2.29324 9.22215 2.84265C8.3999 3.39206 7.75904 4.17295 7.3806 5.08658C7.00216 6.00021 6.90315 7.00555 7.09607 7.97545C7.289 8.94536 7.7652 9.83627 8.46447 10.5355C9.16373 11.2348 10.0546 11.711 11.0245 11.9039C11.9945 12.0969 12.9998 11.9978 13.9134 11.6194C14.827 11.241 15.6079 10.6001 16.1573 9.77785C16.7068 8.95561 17 7.98891 17 7C17 5.67392 16.4732 4.40215 15.5355 3.46447C14.5979 2.52678 13.3261 2 12 2ZM12 10C11.4067 10 10.8266 9.82405 10.3333 9.49441C9.83994 9.16476 9.45542 8.69623 9.22836 8.14805C9.0013 7.59987 8.94189 6.99667 9.05764 6.41473C9.1734 5.83279 9.45912 5.29824 9.87868 4.87868C10.2982 4.45912 10.8328 4.1734 11.4147 4.05764C11.9967 3.94189 12.5999 4.0013 13.1481 4.22836C13.6962 4.45542 14.1648 4.83994 14.4944 5.33329C14.8241 5.82664 15 6.40666 15 7C15 7.79565 14.6839 8.55871 14.1213 9.12132C13.5587 9.68393 12.7956 10 12 10ZM21 21V20C21 18.1435 20.2625 16.363 18.9497 15.0503C17.637 13.7375 15.8565 13 14 13H10C8.14348 13 6.36301 13.7375 5.05025 15.0503C3.7375 16.363 3 18.1435 3 20V21H5V20C5 18.6739 5.52678 17.4021 6.46447 16.4645C7.40215 15.5268 8.67392 15 10 15H14C15.3261 15 16.5979 15.5268 17.5355 16.4645C18.4732 17.4021 19 18.6739 19 20V21H21Z"
                                  fill="white"
                                />
                              </svg>
                            </span>
                          </div>
                          <span className="text-sm first-text-color-for-paragraph">
                            {blog?.author}
                          </span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center ">
                          <span className="text-sm first-text-color-for-paragraph">
                            {blog?.readTime}
                          </span>
                          <div className="h-8 w-8 rounded-full flex justify-center items-center ">
                            <span className="first-text-color-svg">
                              <Clock />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
      {/* blog cards */}
    </div>
  );
};

export default NewBlogs;
