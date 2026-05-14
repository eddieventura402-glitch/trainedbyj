import { NavLink } from "react-router-dom";

export default function BottomNav({ items }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-brand-100 pb-[env(safe-area-inset-bottom)]">
      <ul className="max-w-md mx-auto grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] font-semibold uppercase tracking-wide text-[11px] transition-colors ${
                  isActive ? "text-brand-700" : "text-slate-500 hover:text-brand-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`w-8 h-8 grid place-items-center rounded-full ${
                      isActive ? "bg-brand-100" : ""
                    }`}
                    aria-hidden="true"
                  >
                    {it.icon}
                  </span>
                  <span>{it.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
