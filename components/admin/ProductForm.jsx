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

      console.log(data);

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Product created successfully.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  return (
    <div>
      <h1>Create Product</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Discount Percentage</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Low Stock Threshold</label>
          <input
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Featured</label>
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
        </div>

        <br />

        <div>
          <label>Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Status</label>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
            <option value="out_of_stock">Out Of Stock</option>
          </select>
        </div>

        <br />

        <div>
          <label>Categories</label>

          <br />

          {categories.map((category) => (
            <div key={category.id}>
              <label>
                <input
                  type="checkbox"
                  value={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => {
                    const categoryId = Number(e.target.value);

                    if (e.target.checked) {
                      setSelectedCategories((prev) => [...prev, categoryId]);
                    } else {
                      setSelectedCategories((prev) =>
                        prev.filter((id) => id !== categoryId),
                      );
                    }
                  }}
                />

                {category.name}
              </label>
            </div>
          ))}
        </div>

        <br />

        <div>
          <label>Product Images</label>

          <br />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              setImages(Array.from(e.target.files));
            }}
          />

          <p>
            Selected Images: <strong>{images.length}</strong>
          </p>
        </div>

        <br />

        <button type="submit">Create Product</button>
      </form>
    </div>
  );
}
