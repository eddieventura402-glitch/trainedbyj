import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Login from "./pages/Login";
import Join from "./pages/Join";
import Setup from "./pages/Setup";

import TrainerLayout from "./pages/trainer/TrainerLayout";
import ClientList from "./pages/trainer/ClientList";
import ClientDetail from "./pages/trainer/ClientDetail";
import Programs from "./pages/trainer/Programs";
import ProgramEditor from "./pages/trainer/ProgramEditor";

import ClientLayout from "./pages/client/ClientLayout";
import Home from "./pages/client/Home";
import LogWorkout from "./pages/client/LogWorkout";
import History from "./pages/client/History";
import BodyMetrics from "./pages/client/BodyMetrics";
import Progress from "./pages/client/Progress";

function RoleRedirect() {
  const { profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center text-brand-900 font-display text-2xl uppercase">
        Loading
      </div>
    );
  }
  if (!profile) return <Navigate to="/login" replace />;
  return <Navigate to={profile.role === "trainer" ? "/trainer" : "/client"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/setup" element={<Setup />} />

          <Route
            path="/trainer"
            element={
              <ProtectedRoute role="trainer">
                <TrainerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientList />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/:id" element={<ProgramEditor />} />
          </Route>

          <Route
            path="/client"
            element={
              <ProtectedRoute role="client">
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="log" element={<LogWorkout />} />
            <Route path="history" element={<History />} />
            <Route path="metrics" element={<BodyMetrics />} />
            <Route path="progress" element={<Progress />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
