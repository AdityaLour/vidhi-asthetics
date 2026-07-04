import Link from "next/link";

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>

      <Link href="/admin/products/new">Add Product</Link>
    </div>
  );
}
