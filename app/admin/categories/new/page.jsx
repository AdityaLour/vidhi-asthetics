"use client";

import { useState } from "react";

export default function NewCategoryPage() {
  const [name, setName] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const category = {
      name,
    };

    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(category),
    });

    const data = await response.json();

    console.log(data);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Create Category</button>
      </form>
    </div>
  );
}
