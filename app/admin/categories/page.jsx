import Link from "next/link";
import { getAllCategories } from "@/lib/category";
import CategoryTable from "@/components/admin/CategoryTable";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1>Categories</h1>

      <Link href="/admin/categories/new">Add Category</Link>

      <hr />

      <CategoryTable initialCategories={categories} />
    </div>
  );
}
