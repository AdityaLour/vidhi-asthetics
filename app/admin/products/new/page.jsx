import { getAllCategories } from "@/lib/category";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return <ProductForm categories={categories} />;
}
