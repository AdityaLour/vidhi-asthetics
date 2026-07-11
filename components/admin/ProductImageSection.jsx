"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductImageSection({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.primary_image);

  useEffect(() => {
    setSelectedImage(product.primary_image);
  }, [product]);

  return (
    <div className="product-image-section">
      <div className="overlay-main-image">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            sizes="400px"
            className="overlay-image"
          />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>

      <div className="overlay-thumbnails">
        {product.images.map((image) => (
          <div
            key={image.id}
            className={`thumbnail ${
              selectedImage === image.image_url ? "active-thumbnail" : ""
            }`}
            onClick={() => setSelectedImage(image.image_url)}
          >
            <Image
              src={image.image_url}
              alt={product.name}
              fill
              sizes="70px"
              className="thumbnail-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
