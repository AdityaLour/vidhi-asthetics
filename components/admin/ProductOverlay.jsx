"use client";

import { useEffect, useState } from "react";
import OverlayBackdrop from "./OverlayBackdrop";
import ProductImageSection from "./ProductImageSection";
import ProductInfoSection from "./ProductInfoSection";
import ProductFooter from "./ProductFooter";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function ProductOverlay({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [draftProduct, setDraftProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function loadProduct() {
    try {
      console.log("Loading product");

      const response = await fetch(`/api/admin/products/${productId}`);

      const text = await response.text();
      const data = JSON.parse(text);

      if (!data.success) {
        setMessage({
          type: "error",
          text: data.message,
        });
        return;
      }

      setProduct(data.product);
      setDraftProduct(structuredClone(data.product));
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  async function saveChanges() {
    try {
      const formData = new FormData();

      formData.append("name", draftProduct.name);
      formData.append("description", draftProduct.description);
      formData.append("price", draftProduct.price);
      formData.append("discount_percentage", draftProduct.discount_percentage);
      formData.append("stock", draftProduct.stock);
      formData.append("low_stock_threshold", draftProduct.low_stock_threshold);
      formData.append("featured", draftProduct.featured);
      formData.append("display_order", draftProduct.display_order);
      formData.append("status", draftProduct.status);

      draftProduct.categories.forEach((category) => {
        formData.append("categories", category.id);
      });

      const response = await fetch(`/api/admin/products/${draftProduct.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        setMessage({
          type: "error",
          text: data.message,
        });

        return;
      }

      setProduct(structuredClone(draftProduct));

      setIsEditing(false);

      setMessage({
        type: "success",
        text: "Product updated successfully.",
      });
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Unable to update product.",
      });
    }
  }

  async function deleteProduct() {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        setMessage({
          type: "error",
          text: data.message,
        });

        return;
      }

      setMessage({
        type: "success",
        text: "Product deleted successfully.",
      });

      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 700);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Unable to delete product.",
      });
    }
  }

  return (
    <OverlayBackdrop onClose={onClose} className="overlay-window">
      {loading ? (
        <h2>Loading...</h2>
      ) : (
        <div className="product-overlay-content">
          <ProductImageSection
            product={draftProduct}
            isEditing={isEditing}
            reloadProduct={loadProduct}
            setMessage={setMessage}
          />

          <ProductInfoSection
            product={draftProduct}
            setProduct={setDraftProduct}
            isEditing={isEditing}
          />

          <ProductFooter
            product={draftProduct}
            setProduct={setDraftProduct}
            originalProduct={product}
            setOriginalProduct={setProduct}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onSave={saveChanges}
            onDelete={() => setShowDeleteModal(true)}
            message={message}
          />
        </div>
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Product?"
          message="This action cannot be undone. The product, images and category links will be permanently removed."
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            deleteProduct();
          }}
        />
      )}
    </OverlayBackdrop>
  );
}
