"use client";

import { useState } from "react";

export default function ProductForm({ categories }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [stock, setStock] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [featured, setFeatured] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();

    const product = {
      name,
      description,
      price,
      discount_percentage: discount,
      stock,
      low_stock_threshold: lowStockThreshold,
      featured,
      display_order: displayOrder,
      status,
      categories: selectedCategories,
    };

    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(product),
    });

    const data = await response.json();
    console.log(data);
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
          ></textarea>
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

        <button type="submit">Create Product</button>
      </form>
    </div>
  );
}
