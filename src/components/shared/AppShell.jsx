export default function AppShell({ children, withBottomNav = true }) {
  return (
    <div className="min-h-dvh bg-white">
      <main className={`max-w-md mx-auto px-4 ${withBottomNav ? "pb-28" : "pb-8"} pt-4`}>
        {children}
      </main>
    </div>
  );
}
