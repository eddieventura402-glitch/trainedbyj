import { useNavigate } from "react-router-dom";
import { Wordmark } from "../components/shared/Logo";
import { IconChevronLeft } from "../components/shared/Icons";

const TRAINER_STEPS = [
  { title: "Invite a client", body: "On the Clients tab, tap the green + in the top right. Enter the client's email. Copy the invite link and send it to them however you want (text, email, in person)." },
  { title: "Build their program", body: "On the Programs tab, create a program or use one of the seeded templates (Upper, Lower, Ab). Add exercises from the picker, set target sets and reps. Save as a template to reuse it." },
  { title: "Assign and schedule", body: "Open a client. Assign one of your programs. Set their recurring training days (e.g. Mon/Wed/Fri 6am). Set their next specific session date, time, and location (SW or SE)." },
  { title: "Coach in real time", body: "Watch their session history. Tap a session, leave feedback. Track their body metrics and volume trends in the charts at the bottom of their detail page." },
  { title: "Private notes", body: "On any client's page, the Notes section is just for you. Injuries, goals, personality, what's working. Auto-saves on Save." },
  { title: "Remove a client", body: "Bottom of the client detail page: Danger Zone has a Remove Client button. It deletes their profile and all their data — use with care." },
];

const CLIENT_STEPS = [
  { title: "See what's next", body: "Your home screen shows your next session with Jared — date, time, and location (SW or SE). Underneath are any programs Jared has assigned to you." },
  { title: "Log every workout", body: "Tap Log. Pick an assigned program or log a personal workout. For strength, type each set's weight and reps — volume calculates live. For cardio, pick the type, duration, and distance." },
  { title: "Tap How on any exercise", body: "Don't know an exercise? Tap the How button next to it. You'll see an animated GIF and step-by-step instructions." },
  { title: "Track your body", body: "Body tab logs bodyweight, waist, arms, and body fat percentage. Stats tab charts your progress over time." },
  { title: "Read Jared's feedback", body: "Open any past session in History — if Jared left a note, it's there in green at the top." },
];

export default function HowItWorks({ role = "trainer" }) {
  const nav = useNavigate();
  const steps = role === "trainer" ? TRAINER_STEPS : CLIENT_STEPS;
  const dot = role === "trainer" ? "bg-brand-900" : "bg-brand-600";
  const heading = role === "trainer" ? "How TrainedByJ works for you" : "How to use TrainedByJ";
  const eyebrow = role === "trainer" ? "Coach guide" : "Your guide";

  return (
    <div className="min-h-dvh bg-white pb-28">
      <div className="max-w-md mx-auto px-4 pt-4">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={() => nav(-1)}
            className="w-10 h-10 grid place-items-center rounded-full hover:bg-brand-50 text-brand-900"
            aria-label="Back"
          >
            <IconChevronLeft />
          </button>
          <Wordmark className="text-2xl" />
        </header>

        <div className="text-xs uppercase tracking-widest font-bold text-brand-600">{eyebrow}</div>
        <h1 className="font-display font-bold text-3xl uppercase text-brand-900 tracking-tight mt-1 leading-tight">{heading}</h1>

        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="card flex gap-3">
              <div className={`shrink-0 w-9 h-9 rounded-full ${dot} text-white grid place-items-center font-display font-bold text-lg`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-brand-900 uppercase leading-tight">{s.title}</div>
                <p className="text-sm text-slate-700 mt-1 leading-snug">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 card bg-brand-50 border-brand-200 text-center">
          <div className="text-xs uppercase tracking-widest font-bold text-brand-700">Questions?</div>
          <p className="text-brand-900 mt-1">
            {role === "trainer"
              ? "This app is just the tool. The coaching is you."
              : "Talk to Jared. This app is just the tool — the coaching is him."}
          </p>
        </div>
      </div>
    </div>
  );
}
