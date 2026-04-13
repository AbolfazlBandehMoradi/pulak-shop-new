"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import notFound from "@/assets/Images/Static/svg/blog-not-found.svg"
import notFoundEn from "@/assets/Images/Static/svg/blog-not-found-en.svg"
import { useTranslation } from "react-i18next"

type BlogNotFoundProps = {
  onBack?: () => void
}

export function BlogNotFound({ onBack }: BlogNotFoundProps) {
  const { t, i18n } = useTranslation()

  const isEn = i18n.language === "en"
  const imageSrc = isEn ? notFoundEn : notFound

  return (
    <div className="h-screen flex justify-center items-center w-full">
      <div className="flex flex-col justify-center items-center">
        <img
          src={imageSrc}
          alt={t("blog.notFoundTitle")}
          className="mx-auto w-md h-md object-contain"
        />
        <p className="text-muted-foreground mt-2">
          {t("blog.notFoundMessage")}
        </p>
        <Button onClick={onBack} className="first-style-button-bg items-center gap-2 rounded-xl mt-2 flex justify-between text-center p-4  text-white transition-all duration-300">
          {t("blog.backToBlogs")}
          <ArrowLeft className=" h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
