export default function Logo({ size = "md", className = "" }) {
  const sizes = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-6xl",
  };
  return (
    <div className={`inline-flex items-baseline gap-0 ${className}`}>
      <span className={`font-display font-extrabold uppercase tracking-tight text-brand-900 ${sizes[size]}`}>
        TBJ
      </span>
      <span className={`font-display font-bold uppercase tracking-tight text-brand-600 ${sizes[size]}`}>
        .
      </span>
    </div>
  );
}

export function Wordmark({ className = "" }) {
  return (
    <div className={`font-display font-extrabold uppercase tracking-tight text-brand-900 ${className}`}>
      Trained<span className="text-brand-600">By</span>J
    </div>
  );
}
