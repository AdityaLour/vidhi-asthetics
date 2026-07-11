"use client";

import { useEffect, useState } from "react";

export default function CategorySelector({ product, setProduct }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();

      if (data.success) {
        setCategories(data.categories);
      }
    }

    load();
  }, []);

  function toggle(category) {
    const exists = product.categories.some((c) => c.id === category.id);

    if (exists) {
      setProduct({
        ...product,
        categories: product.categories.filter((c) => c.id !== category.id),
      });
    } else {
      setProduct({
        ...product,
        categories: [...product.categories, category],
      });
    }
  }

  return (
    <div className="category-selector">
      {categories.map((category) => {
        const selected = product.categories.some((c) => c.id === category.id);

        return (
          <button
            key={category.id}
            type="button"
            className={`category-pill ${selected ? "selected" : ""}`}
            onClick={() => toggle(category)}
          >
            {selected && "✓ "}
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
