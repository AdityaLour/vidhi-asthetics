"use client";

export default function OverlayBackdrop({ children, onClose }) {
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="overlay-window" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
