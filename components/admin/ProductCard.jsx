import Image from "next/image";

export default function ProductCard({ product, onClick }) {
  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image">
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="300px"
            className="product-image-tag"
          />
        ) : (
          <div className="no-image">No Image</div>
        )}

        {product.featured && <div className="featured-badge">Featured</div>}
      </div>

      <div className="product-body">
        <h3>{product.name}</h3>

        <div className="price">₹ {Number(product.price).toLocaleString()}</div>

        {product.discount_percentage > 0 && (
          <div className="discount">{product.discount_percentage}% OFF</div>
        )}

        <div className="stock">Stock : {product.stock}</div>

        <div className="categories">{product.categories || "No Category"}</div>

        <div className={`status ${product.status}`}>
          {product.status.replaceAll("_", " ")}
        </div>
      </div>
    </div>
  );
}
