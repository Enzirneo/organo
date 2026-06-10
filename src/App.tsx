import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceProvider } from "@/shared/lib/workspace";
import { ProtectedRoute } from "@/shared/components/auth/ProtectedRoute";
import { PlatformShell } from "@/shared/components/layout/PlatformShell";
import Landing from "./app/routes/Landing";
import DashboardPage from "./features/dashboard/DashboardPage";
import TeamsPage from "./features/teams/TeamsPage";
import PlayersPage from "./features/players/PlayersPage";
import TrainingsPage from "./features/training/TrainingsPage";
import AuthPage from "./features/auth/AuthPage";
import AuthCallback from "./features/auth/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WorkspaceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <PlatformShell>
                    <Routes>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="times" element={<TeamsPage />} />
                      <Route path="jogadores" element={<PlayersPage />} />
                      <Route path="treinos" element={<TrainingsPage />} />
                    </Routes>
                  </PlatformShell>
                </ProtectedRoute>
              }
            />

            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/times" element={<Navigate to="/app/times" replace />} />
            <Route path="/jogadores" element={<Navigate to="/app/jogadores" replace />} />
            <Route path="/treinos" element={<Navigate to="/app/treinos" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
