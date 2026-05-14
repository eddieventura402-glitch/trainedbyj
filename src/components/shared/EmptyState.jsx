export default function EmptyState({ title, body, action }) {
  return (
    <div className="card text-center py-10">
      <h3 className="font-display font-bold uppercase text-xl text-brand-900">{title}</h3>
      {body && <p className="mt-2 text-slate-600">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
