import type { ReactNode } from 'react';

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
      <div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div>
      {children}
    </section>
  </div>;
}

