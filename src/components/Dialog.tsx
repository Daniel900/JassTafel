import type { ReactNode } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  /** Rotate by 180° so the team sitting on the opposite side can read it. */
  rotated?: boolean;
  children: ReactNode;
}

export function Dialog({ title, onClose, rotated, children }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className={`dialog${rotated ? ' rotated' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dialog__header">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Schliessen">
            ✕
          </button>
        </header>
        <div className="dialog__body">{children}</div>
      </div>
    </div>
  );
}
