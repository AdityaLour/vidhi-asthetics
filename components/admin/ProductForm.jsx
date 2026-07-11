"use client";

import { useState } from "react";

export default function ProductForm({ categories }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [stock, setStock] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState("");
  const [status, setStatus] = useState("inactive");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("discount_percentage", discount);
    formData.append("stock", stock);
    formData.append("low_stock_threshold", lowStockThreshold);
    formData.append("featured", featured);
    formData.append("display_order", displayOrder);
    formData.append("status", status);

    selectedCategories.forEach((categoryId) => {
      formData.append("categories", categoryId);
    });

    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.message,
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Product created successfully.",
      });

      setName("");
      setDescription("");
      setPrice("");
      setDiscount("");
      setStock("");
      setLowStockThreshold("");
      setFeatured(false);
      setDisplayOrder("");
      setStatus("inactive");
      setSelectedCategories([]);
      setImages([]);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Something went wrong.",
      });
    }
  }

  return (
    <div className="create-product-page">
      <div className="create-product-header">
        <h1>Create Product</h1>
        <p>Add a new product to your catalog.</p>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        {message && (
          <div className={`overlay-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-group">
          <label>Product Name</label>

          <input
            className="form-input"
            type="text"
            placeholder="Last of Us Painting"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="description-header">
            <label>Description</label>

            <span
              className={`character-count ${
                description.length >= 950
                  ? "danger"
                  : description.length >= 800
                    ? "warning"
                    : ""
              }`}
            >
              {description.length} / 1000
            </span>
          </div>

          <textarea
            className="form-input"
            rows={6}
            maxLength={1000}
            placeholder="Describe your product..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <small className="description-help">
            Maximum 1000 characters allowed.
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price</label>

            <input
              className="form-input"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Discount Percentage</label>

            <input
              className="form-input"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Stock</label>

            <input
              className="form-input"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Low Stock Threshold</label>

            <input
              className="form-input"
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Display Order</label>

            <input
              className="form-input"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Status</label>

            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
              <option value="out_of_stock">Out Of Stock</option>
            </select>
          </div>
        </div>

        <div className="featured-row">
          <label className="featured-toggle">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />

            <span>Featured Product</span>
          </label>
        </div>

        <div className="form-group">
          <label>Categories</label>

          <div className="create-category-selector">
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={`create-category-pill ${
                  selectedCategories.includes(category.id) ? "selected" : ""
                }`}
                onClick={() => {
                  if (selectedCategories.includes(category.id)) {
                    setSelectedCategories((prev) =>
                      prev.filter((id) => id !== category.id),
                    );
                  } else {
                    setSelectedCategories((prev) => [...prev, category.id]);
                  }
                }}
              >
                {selectedCategories.includes(category.id) && "✓ "}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Product Images</label>

          <label className="upload-box">
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={(e) => {
                const newImages = Array.from(e.target.files);
                setImages((prev) => [...prev, ...newImages]);
                e.target.value = "";
              }}
            />

            <div className="upload-content">
              <h3>Upload Product Images</h3>

              <p>Drag and drop or click to browse</p>

              <span>{images.length} image(s) selected</span>
            </div>
          </label>

          {images.length > 0 && (
            <div className="selected-images-preview">
              {images.map((image, index) => (
                <div className="image-preview-card" key={index}>
                  <img
                    src={URL.createObjectURL(image)}
                    alt={image.name}
                    className="image-preview"
                  />

                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setImages((prev) => prev.filter((_, i) => i !== index));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="create-submit-btn" type="submit">
          Create Product
        </button>
      </form>
    </div>
  );
}
