import { useNavigate } from "react-router-dom";
import { IconChevronLeft } from "./Icons";

export default function PageHeader({ title, eyebrow, back = false, right = null }) {
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-brand-100">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
        {back ? (
          <button
            onClick={() => nav(-1)}
            className="w-10 h-10 grid place-items-center rounded-full hover:bg-brand-50 text-brand-900"
            aria-label="Back"
          >
            <IconChevronLeft />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div className="text-[11px] font-semibold uppercase tracking-widest text-brand-600">{eyebrow}</div>
          )}
          <h1 className="font-display font-bold uppercase text-2xl text-brand-900 truncate leading-tight">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-1">{right}</div>
      </div>
    </header>
  );
}
