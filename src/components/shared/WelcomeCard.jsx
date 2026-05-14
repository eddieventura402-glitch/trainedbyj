import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconX } from "./Icons";

// Generic dismissible welcome card. Dismissal is stored in localStorage so it
// only shows on the first visit (per browser).
export default function WelcomeCard({ storageKey, eyebrow, title, items, footerLink }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setDismissed(saved === "1");
  }, [storageKey]);

  const dismiss = () => {
    localStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <section className="mt-4">
      <div className="card bg-brand-50 border-brand-200 relative">
        <button
          onClick={dismiss}
          aria-label="Dismiss welcome"
          className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full hover:bg-white text-brand-900"
        >
          <IconX />
        </button>
        <div className="text-xs uppercase tracking-widest font-bold text-brand-600 pr-10">{eyebrow}</div>
        <h2 className="font-display font-bold text-2xl text-brand-900 uppercase leading-tight mt-1 pr-10">{title}</h2>

        <ul className="mt-4 space-y-3">
          {items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center font-display font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-brand-900 leading-tight">{it.title}</div>
                {it.body && <div className="text-sm text-slate-700 mt-0.5">{it.body}</div>}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={dismiss} className="btn-primary flex-1">Got it</button>
          {footerLink && (
            <Link to={footerLink.to} className="btn-ghost">{footerLink.label}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
