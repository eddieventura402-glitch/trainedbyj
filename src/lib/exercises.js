// Lazy-loads the bundled exercise dataset (1,324 exercises with GIFs).
// JSON lives in /public so it's fetched on demand, not bundled into the JS chunk.

const CDN = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main";

let cache = null;
let inflight = null;

export async function loadExercises() {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = fetch("/exercises.json", { cache: "force-cache" })
    .then((r) => r.json())
    .then((data) => {
      cache = data;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export async function findExerciseById(id) {
  if (!id) return null;
  const list = await loadExercises();
  return list.find((e) => e.id === id) || null;
}

export async function findExerciseByName(name) {
  if (!name) return null;
  const list = await loadExercises();
  const lower = name.trim().toLowerCase();
  // Try exact match first, then includes match
  return (
    list.find((e) => e.name.toLowerCase() === lower) ||
    list.find((e) => e.name.toLowerCase().includes(lower)) ||
    null
  );
}

export function gifUrl(ex) {
  if (!ex?.gif_url) return null;
  return `${CDN}/${ex.gif_url}`;
}

export function imageUrl(ex) {
  if (!ex?.image) return null;
  return `${CDN}/${ex.image}`;
}
