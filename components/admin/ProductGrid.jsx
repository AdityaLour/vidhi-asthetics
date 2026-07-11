import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [], onProductClick }) {
  if (products.length === 0) {
    return <p>No products found.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick(product)}
        />
      ))}
    </div>
  );
}
