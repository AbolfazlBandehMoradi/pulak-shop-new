import { Category } from "@/types";
import CategoryItem from "./CategoryItem";

type Props = {
  categories?: Category[];
};

export default function CategoryTree({ categories }: Props) {
  if (!categories) return null;

  return (
    <div className="space-y-2 mt-2">
      {categories.map((category) => (
        <CategoryItem key={category.id} category={category} />
      ))}
    </div>
  );
}

