import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <LoadingScreen
        title="VERIFYING ADVENTURER PASS"
        subtitle="Unlocking quest gateway and player authorization..."
        icon="⚔️"
        badge="DEVQUEST REALM // ACCESS GATEWAY"
      />
    );
  }
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}