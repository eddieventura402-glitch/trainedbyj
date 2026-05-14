import { Outlet } from "react-router-dom";
import BottomNav from "../../components/shared/BottomNav";
import { IconHome, IconPlus, IconList, IconRuler, IconChart } from "../../components/shared/Icons";

export default function ClientLayout() {
  return (
    <div className="min-h-dvh bg-white">
      <Outlet />
      <BottomNav
        items={[
          { to: "/client", end: true, label: "Home", icon: <IconHome /> },
          { to: "/client/log", label: "Log", icon: <IconPlus /> },
          { to: "/client/history", label: "History", icon: <IconList /> },
          { to: "/client/metrics", label: "Body", icon: <IconRuler /> },
          { to: "/client/progress", label: "Stats", icon: <IconChart /> },
        ]}
      />
    </div>
  );
}
