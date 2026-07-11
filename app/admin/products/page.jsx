import Link from "next/link";

import ProductGrid from "@/components/admin/ProductGrid";
import { getAllProducts } from "@/lib/product";
import ProductsClient from "@/components/admin/ProductClient";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <>
      <div className="products-header">
        <h1>Products</h1>

        <Link href="/admin/products/new" className="create-product-btn">
          Create Product
        </Link>
      </div>

      <ProductsClient products={products} />
    </>
  );
}
