import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn(
    "Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(url || "http://localhost", anon || "anon", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function envConfigured() {
  return Boolean(url && anon && !url.includes("your-project"));
}
