import Link from "next/link";
import { getAllCategories } from "@/lib/category";
import CategoryTable from "@/components/admin/CategoryTable";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <h1>Categories</h1>
          <p>Manage product categories for your store.</p>
        </div>

        <Link href="/admin/categories/new" className="create-category-btn">
          + Add Category
        </Link>
      </div>

      <CategoryTable initialCategories={categories} />
    </div>
  );
}
