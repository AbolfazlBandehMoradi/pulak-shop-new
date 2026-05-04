import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/types";
import { useShopStore } from "@/stores/productsFilterStore";
import { useLangStore } from "@/stores/languageStore";
import { getAllCategoryIds, getCategoryChildren } from "@/utils/categoryHelpers";
import { cn } from "@/utils/cn";

type Props = {
  category: Category;
  level?: number;
};

export default function CategoryItem({ category, level = 0 }: Props) {
  const { categoryIds, setCategoryIds } = useShopStore();
  const lang = useLangStore((s) => s.lang);
  const isRTL = lang === "fa";

  const children = getCategoryChildren(category);
  const [isOpen, setIsOpen] = useState(false);

  const branchIds = getAllCategoryIds(category);

  const checked = branchIds.every((id) => categoryIds.includes(id));
  const indeterminate = !checked && branchIds.some((id) => categoryIds.includes(id));

  const branchSelectedCount = branchIds.filter((id) => categoryIds.includes(id)).length;

  const toggleCategoryTree = () => {
    if (checked) {
      setCategoryIds(categoryIds.filter((id) => !branchIds.includes(id)));
    } else {
      setCategoryIds(Array.from(new Set([...categoryIds, ...branchIds])));
    }
  };

  return (
    <div className="relative" style={{ paddingInlineStart: `${level}rem` }}>
      <div className="flex items-center justify-between px-2 py-1.5 text-sm select-none rounded-md hover:bg-first-50/70 transition-colors">
        <label className="flex flex-1 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={checked}
            aria-checked={indeterminate ? "mixed" : checked}
            ref={(el) => {
              if (el) el.indeterminate = indeterminate;
            }}
            onChange={toggleCategoryTree}
            className="h-4 w-4 rounded border border-first-300 checked:bg-first checked:border-first"
          />

          <span className="first-text-color-for-paragraph">{category.name}</span>

          {branchSelectedCount > 0 && (
            <span className="text-xs first-text-color-for-paragraph-low">({branchSelectedCount})</span>
          )}
        </label>

        {children.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-5 w-5 items-center justify-center first-text-color-for-paragraph-low transition-colors hover:text-first"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : isRTL ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {children.length > 0 && isOpen && (
        <div
          className={cn(
            "mt-1 space-y-1 border-first-100",
            isRTL ? "me-2 border-r pe-2" : "ms-2 border-l ps-2"
          )}
        >
          {children.map((child) => (
            <CategoryItem key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
