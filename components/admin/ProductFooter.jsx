export default function ProductFooter({
  isEditing,
  setIsEditing,
  onSave,
  onDelete,
  message,
}) {
  return (
    <div className="product-footer">
      {message && (
        <div className={`overlay-message ${message.type}`}>{message.text}</div>
      )}

      <div className="footer-actions">
        <button className="delete-btn" onClick={onDelete}>
          Delete Product
        </button>

        <button
          className="save-btn"
          onClick={() => {
            if (!isEditing) {
              setIsEditing(true);
              return;
            }

            onSave();
          }}
        >
          {isEditing ? "Save Changes" : "Update Product"}
        </button>
      </div>
    </div>
  );
}
