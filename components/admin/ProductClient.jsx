"use client";

import { useState } from "react";
import ProductGrid from "./ProductGrid";
import ProductOverlay from "./ProductOverlay";

export default function ProductsClient({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <ProductGrid products={products} onProductClick={setSelectedProduct} />

      {selectedProduct && (
        <ProductOverlay
          productId={selectedProduct.id}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
