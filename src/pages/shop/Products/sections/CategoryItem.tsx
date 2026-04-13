import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Category } from "@/types";
import { useShopStore } from "@/stores/productsFilterStore";
import { getAllCategoryIds, getCategoryChildren } from "@/utils/categoryHelpers";

type Props = {
  category: Category;
  level?: number;
};

export default function CategoryItem({ category, level = 0 }: Props) {
  const { categoryIds, setCategoryIds } = useShopStore();

  const children = getCategoryChildren(category);
  const [isOpen, setIsOpen] = useState(false);

  const branchIds = getAllCategoryIds(category);

  const checked = branchIds.every((id) => categoryIds.includes(id));

  const indeterminate =
    !checked && branchIds.some((id) => categoryIds.includes(id));

  const branchSelectedCount = branchIds.filter((id) =>
    categoryIds.includes(id)
  ).length;

  const toggleCategoryTree = () => {
    if (checked) {
      setCategoryIds(categoryIds.filter((id) => !branchIds.includes(id)));
    } else {
      setCategoryIds(Array.from(new Set([...categoryIds, ...branchIds])));
    }
  };

  return (
    <div className="relative" style={{ paddingInlineStart: `${level}rem` }}>
      <div className="flex items-center px-4 justify-between text-sm select-none">

        <label className="flex items-center gap-2 cursor-pointer flex-1">
          <input
            type="checkbox"
            checked={checked}
            aria-checked={indeterminate ? "mixed" : checked}
            ref={(el) => {
              if (el) el.indeterminate = indeterminate;
            }}
            onChange={toggleCategoryTree}
            className="w-4 h-4 rounded border border-gray-400 checked:bg-first checked:border-first"
          />

          <span>{category.name}</span>

          {branchSelectedCount > 0 && (
            <span className="text-xs text-gray-500">
              ({branchSelectedCount})
            </span>
          )}
        </label>

        {children.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-5 h-5 flex items-center justify-center text-gray-500"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {children.length > 0 && isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l border-gray-300 pl-2">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}