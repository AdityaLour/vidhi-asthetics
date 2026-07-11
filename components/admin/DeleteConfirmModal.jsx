export default function DeleteConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="delete-backdrop">
      <div className="delete-modal">
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="delete-actions">
          <button className="cancel-delete-btn" onClick={onCancel}>
            Cancel
          </button>

          <button className="confirm-delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
