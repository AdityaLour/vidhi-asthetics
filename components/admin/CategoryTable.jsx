"use client";

import { useState } from "react";

export default function CategoryTable({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [deleteId, setDeleteId] = useState(null);

  const [message, setMessage] = useState(null);

  async function handleDelete() {
    try {
      const response = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.message,
        });

        return;
      }

      setCategories((prev) =>
        prev.filter((category) => category.id !== deleteId),
      );

      setDeleteId(null);

      setMessage({
        type: "success",
        text: "Category deleted successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Unable to delete category.",
      });
    }
  }

  async function handleEdit(id) {
    if (!editingName.trim()) {
      setMessage({
        type: "error",
        text: "Category name cannot be empty.",
      });

      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.message,
        });

        return;
      }

      setCategories((prev) =>
        prev.map((category) =>
          category.id === id
            ? {
                ...category,
                name: editingName.trim(),
              }
            : category,
        ),
      );

      setEditingId(null);

      setMessage({
        type: "success",
        text: "Category updated successfully.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Unable to update category.",
      });
    }
  }

  return (
    <>
      {message && (
        <div className={`overlay-message ${message.type}`}>{message.text}</div>
      )}

      <div className="category-grid">
        {categories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-left">
              {editingId === category.id ? (
                <input
                  className="category-edit-input"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
              ) : (
                <>
                  <h3>{category.name}</h3>

                  <span className="category-count">
                    {category.total_products} products
                  </span>
                </>
              )}
            </div>

            <div className="category-actions">
              {editingId === category.id ? (
                <>
                  <button
                    className="save-category-btn"
                    onClick={() => handleEdit(category.id)}
                  >
                    Save
                  </button>

                  <button
                    className="cancel-category-btn"
                    onClick={() => {
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="edit-category-btn"
                    onClick={() => {
                      setEditingId(category.id);
                      setEditingName(category.name);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-category-btn"
                    onClick={() => setDeleteId(category.id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {deleteId && (
        <div className="delete-backdrop">
          <div className="delete-modal">
            <h2>Delete Category</h2>

            <p>This action cannot be undone.</p>

            <div className="delete-actions">
              <button
                className="cancel-delete-btn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button className="confirm-delete-btn" onClick={handleDelete}>
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
