import { Outlet } from "react-router-dom";
import BottomNav from "../../components/shared/BottomNav";
import { IconUsers, IconDumbbell } from "../../components/shared/Icons";

export default function TrainerLayout() {
  return (
    <div className="min-h-dvh bg-white">
      <Outlet />
      <BottomNav
        items={[
          { to: "/trainer", end: true, label: "Clients", icon: <IconUsers /> },
          { to: "/trainer/programs", label: "Programs", icon: <IconDumbbell /> },
        ]}
      />
    </div>
  );
}
