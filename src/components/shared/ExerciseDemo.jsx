import { useEffect, useState } from "react";
import { findExerciseById, findExerciseByName, gifUrl, imageUrl } from "../../lib/exercises";
import { IconX } from "./Icons";

export default function ExerciseDemo({ exerciseId, exerciseName, onClose }) {
  const [ex, setEx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let match = null;
      if (exerciseId) match = await findExerciseById(exerciseId);
      if (!match && exerciseName) match = await findExerciseByName(exerciseName);
      if (!cancelled) {
        setEx(match);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [exerciseId, exerciseName]);

  const youtubeLink = `https://www.youtube.com/results?search_query=${encodeURIComponent((exerciseName || ex?.name || "") + " how to do")}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md max-h-[90dvh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-brand-100 flex items-center gap-2">
          <h2 className="font-display font-bold uppercase text-xl text-brand-900 flex-1 truncate">
            {ex?.name || exerciseName || "Exercise"}
          </h2>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 grid place-items-center rounded-full hover:bg-brand-50 text-brand-900">
            <IconX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center text-slate-500">Loading demo</div>
          )}

          {!loading && !ex && (
            <div className="p-6 text-center">
              <div className="text-slate-600">No bundled demo for this exercise.</div>
              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 inline-flex"
              >
                Watch on YouTube
              </a>
            </div>
          )}

          {!loading && ex && (
            <div className="p-4 space-y-4">
              {gifUrl(ex) && (
                <div className="bg-slate-50 rounded-xl overflow-hidden">
                  <img
                    src={gifUrl(ex)}
                    alt={`${ex.name} demo`}
                    className="w-full h-auto"
                    loading="eager"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {ex.target && <span className="chip">{ex.target}</span>}
                {ex.equipment && <span className="chip">{ex.equipment}</span>}
                {ex.body_part && <span className="chip">{ex.body_part}</span>}
              </div>

              {Array.isArray(ex.steps) && ex.steps.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-widest font-bold text-brand-600 mb-2">How to do it</div>
                  <ol className="space-y-2 list-decimal list-inside text-slate-800">
                    {ex.steps.map((s, i) => (
                      <li key={i} className="leading-snug">{s}</li>
                    ))}
                  </ol>
                </div>
              )}

              {!ex.steps?.length && ex.instructions && (
                <div>
                  <div className="text-xs uppercase tracking-widest font-bold text-brand-600 mb-2">How to do it</div>
                  <p className="text-slate-800 leading-snug">{ex.instructions}</p>
                </div>
              )}

              {Array.isArray(ex.secondary_muscles) && ex.secondary_muscles.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-widest font-bold text-brand-600 mb-1">Also works</div>
                  <div className="text-sm text-slate-700">{ex.secondary_muscles.join(", ")}</div>
                </div>
              )}

              <a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full"
              >
                Watch full tutorial on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
