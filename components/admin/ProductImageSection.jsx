"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductImageSection({
  product,
  reloadProduct,
  setMessage,
  isEditing,
}) {
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
          <div key={image.id} className="thumbnail-wrapper">
            <div
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

            {isEditing && (
              <div className="thumbnail-actions">
                {image.is_primary ? (
                  <span className="primary-badge">★ Primary</span>
                ) : (
                  <button
                    className="primary-btn"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `/api/admin/products/${product.id}/images/${image.id}`,
                          {
                            method: "PATCH",
                          },
                        );

                        const data = await response.json();

                        if (!data.success) {
                          setMessage({
                            type: "error",
                            text: data.message,
                          });
                          return;
                        }

                        await reloadProduct();

                        setMessage({
                          type: "success",
                          text: "Primary image updated.",
                        });
                      } catch {
                        setMessage({
                          type: "error",
                          text: "Unable to update image.",
                        });
                      }
                    }}
                  >
                    ☆ Make Primary
                  </button>
                )}

                <button
                  className="delete-image-btn"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        `/api/admin/products/${product.id}/images/${image.id}`,
                        {
                          method: "DELETE",
                        },
                      );

                      const data = await response.json();

                      if (!data.success) {
                        setMessage({
                          type: "error",
                          text: data.message,
                        });
                        return;
                      }

                      await reloadProduct();

                      setMessage({
                        type: "success",
                        text: "Image deleted.",
                      });
                    } catch {
                      setMessage({
                        type: "error",
                        text: "Unable to delete image.",
                      });
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <label className="upload-more-images">
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={async (e) => {
              try {
                const formData = new FormData();

                Array.from(e.target.files).forEach((file) => {
                  formData.append("images", file);
                });

                const response = await fetch(
                  `/api/admin/products/${product.id}/images`,
                  {
                    method: "POST",
                    body: formData,
                  },
                );

                const data = await response.json();

                if (!data.success) {
                  setMessage({
                    type: "error",
                    text: data.message,
                  });

                  return;
                }

                await reloadProduct();

                setMessage({
                  type: "success",
                  text: "Images uploaded successfully.",
                });

                e.target.value = "";
              } catch {
                setMessage({
                  type: "error",
                  text: "Unable to upload images.",
                });
              }
            }}
          />
          + Upload Images
        </label>
      )}
    </div>
  );
}
