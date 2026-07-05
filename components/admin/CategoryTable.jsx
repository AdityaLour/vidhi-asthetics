"use client";

import { useState } from "react";

export default function CategoryTable({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    alert(data.message);

    if (!response.ok) {
      return;
    }

    setCategories((prev) => prev.filter((category) => category.id !== id));
  }

  async function handleEdit(category) {
    const newName = window.prompt("Edit Category", category.name);

    if (!newName || newName.trim() === "") {
      return;
    }

    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName.trim(),
      }),
    });

    const data = await response.json();

    alert(data.message);

    if (!response.ok) {
      return;
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, name: newName.trim() } : c,
      ),
    );
  }

  return (
    <div>
      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        categories.map((category) => (
          <div
            key={category.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span>
              {category.name} ({category.total_products})
            </span>

            <div>
              <button onClick={() => handleEdit(category)}>Edit</button>

              <button onClick={() => handleDelete(category.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
