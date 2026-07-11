import CategorySelector from "./CategorySelector";
export default function ProductInfoSection({ product, setProduct, isEditing }) {
  const discountedPrice =
    product.price - (product.price * product.discount_percentage) / 100;

  return (
    <div className="product-info-section">
      {isEditing ? (
        <input
          className="edit-input title-input"
          value={product.name}
          onChange={(e) =>
            setProduct({
              ...product,
              name: e.target.value,
            })
          }
        />
      ) : (
        <h2>{product.name}</h2>
      )}

      {/* PRICE */}

      <div className="info-row">
        <span>Price</span>

        {isEditing ? (
          <input
            type="number"
            className="edit-input"
            value={product.price}
            onChange={(e) =>
              setProduct({
                ...product,
                price: Number(e.target.value),
              })
            }
          />
        ) : (
          <div className="price-section">
            {product.discount_percentage > 0 ? (
              <>
                <div className="discounted-price">
                  ₹ {discountedPrice.toFixed(2)}
                </div>

                <div className="original-price">
                  ₹ {Number(product.price).toFixed(2)}
                </div>

                <div className="discount-badge">
                  {product.discount_percentage}% OFF
                </div>
              </>
            ) : (
              <div className="discounted-price">
                ₹ {Number(product.price).toFixed(2)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DISCOUNT */}

      <div className="info-row">
        <span>Discount</span>

        {isEditing ? (
          <input
            type="number"
            className="edit-input"
            value={product.discount_percentage}
            onChange={(e) =>
              setProduct({
                ...product,
                discount_percentage: Number(e.target.value),
              })
            }
          />
        ) : (
          <strong>{product.discount_percentage}%</strong>
        )}
      </div>

      {/* STOCK */}

      <div className="info-row">
        <span>Stock</span>

        {isEditing ? (
          <input
            type="number"
            className="edit-input"
            value={product.stock}
            onChange={(e) =>
              setProduct({
                ...product,
                stock: Number(e.target.value),
              })
            }
          />
        ) : (
          <strong>{product.stock}</strong>
        )}
      </div>

      {/* STATUS */}

      <div className="info-row">
        <span>Status</span>

        {isEditing ? (
          <select
            className="edit-input"
            value={product.status}
            onChange={(e) =>
              setProduct({
                ...product,
                status: e.target.value,
              })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out Of Stock</option>
          </select>
        ) : (
          <strong>{product.status}</strong>
        )}
      </div>

      {/* FEATURED */}

      {/* FEATURED */}

      <div className="info-row featured-row">
        <span>Featured</span>

        {isEditing ? (
          <input
            type="checkbox"
            checked={product.featured}
            onChange={(e) =>
              setProduct({
                ...product,
                featured: e.target.checked,
              })
            }
          />
        ) : (
          <strong>{product.featured ? "Yes" : "No"}</strong>
        )}
      </div>

      {/* CATEGORIES */}

      <div className="info-row">
        <span>Categories</span>

        {!isEditing ? (
          <div className="category-display">
            {product.categories.length === 0 ? (
              <span className="empty-category">No Category</span>
            ) : (
              <>
                <span className="category-chip">
                  {product.categories[0].name}
                </span>

                {product.categories.length > 1 && (
                  <details className="category-dropdown">
                    <summary className="category-more">
                      +{product.categories.length - 1}
                    </summary>

                    <div className="category-menu">
                      {product.categories.slice(1).map((category) => (
                        <div key={category.id} className="category-menu-item">
                          {category.name}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="category-edit">
            <CategorySelector product={product} setProduct={setProduct} />
          </div>
        )}
      </div>

      <hr />

      <h3>Description</h3>

      {isEditing ? (
        <textarea
          className="edit-input"
          rows={6}
          value={product.description}
          onChange={(e) =>
            setProduct({
              ...product,
              description: e.target.value,
            })
          }
        />
      ) : (
        <p>{product.description}</p>
      )}
    </div>
  );
}
