"use client";

import { useState } from "react";

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
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

      setMessage({
        type: "success",
        text: "Category created successfully.",
      });

      setName("");
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Unable to create category.",
      });
    }
  }

  return (
    <div className="create-category-page">
      <div className="create-category-header">
        <h1>Create Category</h1>

        <p>Create categories to organize your products and improve browsing.</p>
      </div>

      <form className="create-category-form" onSubmit={handleSubmit}>
        {message && (
          <div className={`overlay-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-group">
          <label>Category Name</label>

          <input
            className="form-input"
            type="text"
            placeholder="Paintings"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="character-counter">{name.length}/100 characters</div>
        </div>

        <button
          className="create-submit-btn"
          type="submit"
          disabled={!name.trim()}
        >
          Create Category
        </button>
      </form>
    </div>
  );
}
